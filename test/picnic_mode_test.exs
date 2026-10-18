defmodule Picape.PicnicModeTest do
  use Picape.DataCase

  alias Picape.Recipe.Ingredient
  alias Picape.{Checklist, Order, Picnic, Repo, Settings, Supermarket}

  test "picnic mode reads the Picnic cart plus the checklist fallback" do
    brood =
      insert!(:ingredient, name: "Brood", supermarket_product_id: 519_017, picnic_product_id: "s2001")

    insert!(:manual_ingredient, ingredient_id: brood.id, quantity: 1)
    rijst = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)
    insert!(:manual_ingredient, ingredient_id: rijst.id, quantity: 2)

    {:ok, %{mode: "picnic"}} = Order.set_mode("picnic")

    assert {:ok, line} = Order.current()

    brood_item = Enum.find(line.items, &(&1.name == "Volkoren brood"))
    assert brood_item.store == "picnic"
    assert brood_item.ingredient_id == brood.id

    rijst_item = Enum.find(line.items, &(&1.name == "Rijst"))
    assert rijst_item.store == "checklist"
    assert rijst_item.ingredient_id == rijst.id
    assert rijst_item.checked == false
  end

  test "syncing pushes mapped ingredients into the Picnic cart" do
    melk = insert!(:ingredient, name: "Melk", picnic_product_id: "s2002")
    insert!(:manual_ingredient, ingredient_id: melk.id, quantity: 3)

    assert {:ok, %{mode: "picnic", pushed_to_supermarket: true}} = Order.set_mode("picnic")

    assert picnic_quantity(Picnic.cart(), "s2002") == 3
    # A product the Picnic app added itself is left alone.
    assert picnic_quantity(Picnic.cart(), "s2001") == 1
  end

  test "unplanning a recipe takes its products out of the Picnic cart" do
    melk = insert!(:ingredient, name: "Melk", picnic_product_id: "s2002")
    recipe = insert!(:recipe, title: "Nasi", ingredients: [melk])

    {:ok, _} = Order.set_mode("picnic")
    assert {:ok, _} = Order.plan_recipe("1", recipe.id)
    assert picnic_quantity(Picnic.cart(), "s2002") == 1

    assert {:ok, _} = Order.plan_recipe("1", recipe.id, true)
    assert picnic_article(Picnic.cart(), "s2002") == nil
  end

  test "a rejected Picnic auth key falls back to the checklist" do
    rijst =
      insert!(:ingredient,
        name: "Rijst",
        supermarket_product_id: 10_583_837,
        picnic_product_id: "s2002"
      )

    insert!(:manual_ingredient, ingredient_id: rijst.id, quantity: 2)

    HTTPoison.post!("http://localhost:4021/__picnic_auth_error", "")

    assert {:ok, %{mode: "picnic", pushed_to_supermarket: false}} = Order.set_mode("picnic")

    assert {:ok, line} = Order.current()
    assert line.supermarket_reachable == false
    assert [%{name: "Rijst", quantity: 2, store: "checklist"}] = line.items
  end

  test "an unmapped ingredient reports its ordered quantity" do
    rijst = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)
    insert!(:manual_ingredient, ingredient_id: rijst.id, quantity: 2)

    {:ok, _} = Order.set_mode("picnic")

    assert {:ok, quantities} = Order.ingredients_ordered_quantity("1", [rijst.id])
    assert quantities[rijst.id] == 2
  end

  test "a mapped ingredient reports its ordered quantity from the Picnic cart" do
    brood =
      insert!(:ingredient,
        name: "Brood",
        supermarket_product_id: 519_017,
        picnic_product_id: "s2001"
      )

    {:ok, _} = Order.set_mode("picnic")

    assert {:ok, quantities} = Order.ingredients_ordered_quantity("1", [brood.id])
    assert quantities[brood.id] == 1
  end

  test "quantity 0 takes the product out of the Picnic cart" do
    brood = insert!(:ingredient, name: "Brood", picnic_product_id: "s2001")
    insert!(:manual_ingredient, ingredient_id: brood.id, quantity: 1)

    {:ok, _} = Order.set_mode("picnic")
    assert {:ok, _} = Order.order_ingredient("1", brood.id, 0)

    assert picnic_article(Picnic.cart(), "s2001") == nil
  end

  test "unmapped ingredients stay tickable checklist items" do
    rijst = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)
    insert!(:manual_ingredient, ingredient_id: rijst.id, quantity: 1)

    {:ok, _} = Order.set_mode("picnic")

    assert {:ok, _} = Checklist.check(rijst.id, true)

    assert {:ok, line} = Order.current()
    assert %{checked: true, store: "checklist"} = Enum.find(line.items, &(&1.name == "Rijst"))
  end

  test "picnic sync leaves the supermarket basket and the AH mapping untouched" do
    melk =
      insert!(:ingredient,
        name: "Melk",
        supermarket_product_id: 10_583_837,
        picnic_product_id: "s2002"
      )

    insert!(:manual_ingredient, ingredient_id: melk.id, quantity: 3)

    before = Supermarket.cart()

    {:ok, _} = Order.set_mode("picnic")

    Supermarket.invalidate_cart()
    assert Supermarket.cart() == before
    assert Repo.get!(Ingredient, melk.id).supermarket_product_id == 10_583_837
  end

  test "a dead Picnic falls back to the checklist" do
    rijst =
      insert!(:ingredient,
        name: "Rijst",
        supermarket_product_id: 10_583_837,
        picnic_product_id: "s2002"
      )

    insert!(:manual_ingredient, ingredient_id: rijst.id, quantity: 2)

    {:ok, _} = Order.set_mode("picnic")
    supermarket_down()

    assert {:ok, line} = Order.current()
    assert line.supermarket_reachable == false
    assert [%{name: "Rijst", quantity: 2, store: "checklist"}] = line.items
  end

  test "switching to picnic while Picnic is down still switches" do
    supermarket_down()

    assert {:ok, %{mode: "picnic", pushed_to_supermarket: false, error: error}} =
             Order.set_mode("picnic")

    assert error =~ "unreachable"
    assert Settings.mode() == "picnic"
  end

  test "switching back to ah pushes the list into the supermarket basket" do
    rijst = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)

    {:ok, _} = Order.set_mode("picnic")
    {:ok, _} = Order.order_ingredient("1", rijst.id, 2)

    assert {:ok, %{mode: "ah", pushed_to_supermarket: true}} = Order.set_mode("ah")

    Supermarket.invalidate_cart()
    assert product_quantity(Supermarket.cart(), 10_583_837) == 2
  end

  defp supermarket_down() do
    HTTPoison.post!("http://localhost:4021/__down", "")
    Picnic.invalidate_cart()
    Supermarket.invalidate_cart()
    Supermarket.invalidate_orders()
  end

  defp picnic_article(cart, product_id) do
    cart["items"]
    |> Enum.flat_map(& &1["items"])
    |> Enum.find(&(&1["id"] == product_id))
  end

  defp picnic_quantity(cart, product_id) do
    case picnic_article(cart, product_id) do
      nil -> nil
      article -> Enum.find(article["decorators"], &(&1["type"] == "QUANTITY"))["quantity"]
    end
  end

  defp product_quantity(cart, product_id) do
    Enum.find_value(cart["items"], fn
      %{"product" => %{"id" => ^product_id}, "quantity" => quantity} -> quantity
      _ -> nil
    end)
  end
end
