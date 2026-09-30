defmodule Picape.Order.SyncSupermarketTest do
  use Picape.DataCase

  alias Picape.{Order, Supermarket}
  alias Picape.Recipe.Ingredient
  alias Picape.Repo

  @fake "http://localhost:4021"

  test "an unavailable wanted product is swapped for its replacement" do
    kip =
      insert!(:ingredient,
        name: "Kipfilet",
        supermarket_product_id: 10_291_994,
        supermarket_product_raw: %{
          "productCard" => %{"orderAvailabilityStatus" => "OUT_OF_STOCK"}
        }
      )

    sinaas = insert!(:ingredient, name: "Sinaasappels", supermarket_product_id: 519_017)
    replace(kip, sinaas)

    assert {:ok, _line} = Order.order_ingredient("1", kip.id, 2)

    # The basket tops the sinaasappelen up to two and keeps the kipfilet it
    # cannot sell: Picape never deletes what it did not order itself, so the
    # unavailable product stays with its badge.
    Supermarket.invalidate_cart()
    cart = Supermarket.cart()
    assert product_quantity(cart, 519_017) == 2
    assert product_quantity(cart, 10_291_994) == 2

    assert %{519_017 => %Ingredient{name: "Kipfilet"}} = Order.substitutions("1")
  end

  test "an unavailable wanted product without a replacement stays untouched" do
    kip = insert!(:ingredient, name: "Kipfilet", supermarket_product_id: 10_291_994)

    assert {:ok, _line} = Order.order_ingredient("1", kip.id, 2)

    Supermarket.invalidate_cart()
    assert product_in_cart?(Supermarket.cart(), 10_291_994)
    assert Order.substitutions("1") == %{}
  end

  test "a paid order freezes Picape: it archives the plan once and writes nothing" do
    rijst = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)
    recipe = insert!(:recipe, title: "Nasi", ingredients: [rijst])
    insert!(:planned_recipe, recipe_id: recipe.id)

    place_order()

    assert {:ok, line} = Order.sync_supermarket("1")
    assert line.is_placed

    # The plan moved to the supermarket's own order number, exactly once.
    assert Order.last_order_id() == "12345678"
    assert Order.planned_recipes("12345678") == {:ok, [recipe.id]}

    assert {:ok, _} = Order.sync_supermarket("1")
    assert Order.planned_recipes("1") == {:ok, []}

    # A buy during the freeze queues on the live line, it never reaches the
    # basket the paid order still owns.
    melk = insert!(:ingredient, name: "Melk", supermarket_product_id: 999_999)
    assert {:ok, _} = Order.order_ingredient("1", melk.id, 2)

    assert Order.manual_ingredients("1") == {:ok, %{999_999 => 2}}
    assert Order.manual_ingredients("12345678") == {:ok, %{}}

    Supermarket.invalidate_cart()
    refute product_in_cart?(Supermarket.cart(), 999_999)
  end

  test "delivering the order lifts the freeze and syncs what queued" do
    melk = insert!(:ingredient, name: "Melk", supermarket_product_id: 999_999)

    place_order()
    assert {:ok, line} = Order.sync_supermarket("1")
    assert line.is_placed

    assert {:ok, _} = Order.order_ingredient("1", melk.id, 2)

    deliver_order()

    assert {:ok, line} = Order.sync_supermarket("1")
    refute line.is_placed

    Supermarket.invalidate_cart()
    assert product_quantity(Supermarket.cart(), 999_999) == 2
  end

  defp place_order do
    HTTPoison.post!(@fake <> "/__place_order", "")
    Supermarket.invalidate_orders()
  end

  defp deliver_order do
    HTTPoison.post!(@fake <> "/__deliver_order", "")
    Supermarket.invalidate_orders()
  end

  defp replace(ingredient, replacement) do
    ingredient
    |> Ecto.Changeset.change(replacement_ingredient_id: replacement.id)
    |> Repo.update!()
  end

  defp product_in_cart?(cart, product_id) do
    Enum.any?(cart["items"], &(&1["product"]["id"] == product_id))
  end

  defp product_quantity(cart, product_id) do
    Enum.find_value(cart["items"], fn
      %{"product" => %{"id" => ^product_id}, "quantity" => quantity} -> quantity
      _ -> nil
    end)
  end
end
