defmodule Picape.PicnicModeTest do
  use Picape.DataCase

  alias Picape.Recipe.Ingredient
  alias Picape.{Checklist, Ingredients, Order, Picnic, Repo, Settings, Supermarket}
  alias Picape.SupermarketFake

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

  test "remapping to another Picnic product takes the old one out of the cart" do
    brood = insert!(:ingredient, name: "Brood", picnic_product_id: "s2001")
    insert!(:manual_ingredient, ingredient_id: brood.id, quantity: 1)
    {:ok, _} = Order.set_mode("picnic")

    assert {:ok, _} =
             Ingredients.edit_ingredient(%{ingredient_id: brood.id, picnic_product_id: "s2002"})

    assert %{
             method: "POST",
             path: "/api/15/cart/remove_product",
             body: %{"product_id" => "s2001", "count" => 1}
           } = Enum.find(SupermarketFake.requests(), &(&1.path =~ "remove_product"))

    Picnic.invalidate_cart()
    cart = Picnic.cart()
    assert picnic_article(cart, "s2001") == nil
    assert picnic_quantity(cart, "s2002") == 1
  end

  test "switching back to ah pushes the list into the supermarket basket" do
    rijst = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)

    {:ok, _} = Order.set_mode("picnic")
    {:ok, _} = Order.order_ingredient("1", rijst.id, 2)

    assert {:ok, %{mode: "ah", pushed_to_supermarket: true}} = Order.set_mode("ah")

    Supermarket.invalidate_cart()
    assert product_quantity(Supermarket.cart(), 10_583_837) == 2
  end

  test "an ingredient without a store product stays on the checklist part of the list" do
    basilicum = insert!(:ingredient, name: "Basilicum")
    insert!(:manual_ingredient, ingredient_id: basilicum.id, quantity: 2)
    rucola = insert!(:ingredient, name: "Rucola")
    recipe = insert!(:recipe, title: "Pasta", ingredients: [rucola])
    insert!(:planned_recipe, recipe_id: recipe.id)

    {:ok, _} = Order.set_mode("picnic")

    assert {:ok, line} = Order.current()

    assert %{name: "Basilicum", quantity: 2, store: "checklist", ingredient_id: ingredient_id} =
             Enum.find(line.items, &(&1.name == "Basilicum"))

    assert ingredient_id == basilicum.id
    assert %{name: "Rucola", quantity: 1, store: "checklist"} = Enum.find(line.items, &(&1.name == "Rucola"))
  end

  test "a mapped ingredient whose product is not in the cart still shows as a checklist item" do
    melk = insert!(:ingredient, name: "Melk", picnic_product_id: "s2002")
    insert!(:manual_ingredient, ingredient_id: melk.id, quantity: 2)

    # Setting the flag directly skips the sync set_mode triggers, so the
    # product never made it into the cart — like a push that failed.
    {:ok, _} = Settings.set("mode", "picnic")

    assert {:ok, line} = Order.current()
    assert %{name: "Melk", quantity: 2, store: "checklist"} = Enum.find(line.items, &(&1.name == "Melk"))
  end

  test "switching ah -> picnic -> checklist -> ah keeps every quantity" do
    melk =
      insert!(:ingredient,
        name: "Melk",
        supermarket_product_id: 10_583_837,
        picnic_product_id: "s2002"
      )

    rijst = insert!(:ingredient, name: "Rijst", supermarket_product_id: 519_017)
    basilicum = insert!(:ingredient, name: "Basilicum")

    insert!(:manual_ingredient, ingredient_id: melk.id, quantity: 2)
    insert!(:manual_ingredient, ingredient_id: rijst.id, quantity: 1)
    insert!(:manual_ingredient, ingredient_id: basilicum.id, quantity: 3)

    for mode <- ["picnic", "checklist", "ah"] do
      assert {:ok, _} = Order.set_mode(mode)
    end

    {:ok, cart} = Order.cart("1")

    assert Map.new(Map.values(cart), &{&1.ingredient.name, &1.quantity}) ==
             %{"Melk" => 2, "Rijst" => 1, "Basilicum" => 3}

    Supermarket.invalidate_cart()
    assert product_quantity(Supermarket.cart(), 10_583_837) == 2
    assert product_quantity(Supermarket.cart(), 519_017) == 1
  end

  test "mapping in picnic mode pushes the wanted quantity into the cart" do
    gist = insert!(:ingredient, name: "Gist", supermarket_product_id: 519_017)
    insert!(:manual_ingredient, ingredient_id: gist.id, quantity: 1)

    {:ok, _} = Order.set_mode("picnic")

    assert {:ok, _} =
             Ingredients.edit_ingredient(%{ingredient_id: gist.id, picnic_product_id: "s2002"})

    assert picnic_quantity(Picnic.cart(), "s2002") == 1
    assert {:ok, quantities} = Order.ingredients_ordered_quantity("1", [gist.id])
    assert quantities[gist.id] == 1
  end

  test "an unavailable mapped product falls back to its replacement" do
    avocado_regular =
      insert!(:ingredient,
        name: "Avocado",
        supermarket_product_id: 10_583_837,
        picnic_product_id: "s2002"
      )

    avocado =
      insert!(:ingredient,
        name: "Avocado bio",
        supermarket_product_id: 519_017,
        picnic_product_id: "s2001",
        replacement_ingredient_id: avocado_regular.id
      )

    insert!(:manual_ingredient, ingredient_id: avocado.id, quantity: 2)

    HTTPoison.post!(
      "http://localhost:4021/__picnic_unavailable",
      Jason.encode!(%{product_id: "s2001"}),
      [{"content-type", "application/json"}]
    )

    assert {:ok, %{mode: "picnic", pushed_to_supermarket: true}} = Order.set_mode("picnic")

    # The replacement takes the wanted quantity; the unavailable product stays
    # in the cart flagged, the way the supermarket basket keeps its own.
    assert picnic_quantity(Picnic.cart(), "s2002") == 2

    assert {:ok, line} = Order.current()
    avocado_item = Enum.find(line.items, &(&1.id == "s2001"))
    assert avocado_item.is_orderable == false

    assert %{"s2002" => %{id: substituted_for}} = Order.substitutions("1")
    assert substituted_for == avocado.id
  end

  test "a manual quantity on an unavailable product adds onto the planned replacement" do
    avocado_regular =
      insert!(:ingredient,
        name: "Avocado",
        supermarket_product_id: 10_583_837,
        picnic_product_id: "s2002"
      )

    avocado =
      insert!(:ingredient,
        name: "Avocado bio",
        supermarket_product_id: 519_017,
        picnic_product_id: "s2001",
        replacement_ingredient_id: avocado_regular.id
      )

    recipe = insert!(:recipe, title: "Guacamole", ingredients: [avocado_regular])
    insert!(:planned_recipe, recipe_id: recipe.id)
    insert!(:manual_ingredient, ingredient_id: avocado.id, quantity: 2)

    HTTPoison.post!(
      "http://localhost:4021/__picnic_unavailable",
      Jason.encode!(%{product_id: "s2001"}),
      [{"content-type", "application/json"}]
    )

    assert {:ok, %{mode: "picnic", pushed_to_supermarket: true}} = Order.set_mode("picnic")

    assert picnic_quantity(Picnic.cart(), "s2002") == 3
  end

  test "a manual 0 on an unavailable product keeps the planned replacement" do
    avocado_regular =
      insert!(:ingredient,
        name: "Avocado",
        supermarket_product_id: 10_583_837,
        picnic_product_id: "s2002"
      )

    avocado =
      insert!(:ingredient,
        name: "Avocado bio",
        supermarket_product_id: 519_017,
        picnic_product_id: "s2001",
        replacement_ingredient_id: avocado_regular.id
      )

    recipe = insert!(:recipe, title: "Guacamole", ingredients: [avocado_regular])
    insert!(:planned_recipe, recipe_id: recipe.id)
    insert!(:manual_ingredient, ingredient_id: avocado.id, quantity: 0)

    HTTPoison.post!(
      "http://localhost:4021/__picnic_unavailable",
      Jason.encode!(%{product_id: "s2001"}),
      [{"content-type", "application/json"}]
    )

    assert {:ok, %{mode: "picnic", pushed_to_supermarket: true}} = Order.set_mode("picnic")

    assert picnic_quantity(Picnic.cart(), "s2002") == 1
  end

  test "mapping an ingredient the cart does not hold pins no quantity" do
    melk = insert!(:ingredient, name: "Melk", supermarket_product_id: 519_017)
    recipe = insert!(:recipe, title: "Vla", ingredients: [melk])
    insert!(:planned_recipe, recipe_id: recipe.id)

    {:ok, _} = Order.set_mode("picnic")

    assert {:ok, _} =
             Ingredients.edit_ingredient(%{ingredient_id: melk.id, picnic_product_id: "s2002"})

    assert Repo.get_by(Order.ManualIngredient, line_id: "1", ingredient_id: melk.id) == nil
    assert picnic_quantity(Picnic.cart(), "s2002") == 1

    # Nothing pinned means unplanning takes the product off the list again.
    assert {:ok, _} = Order.plan_recipe("1", recipe.id, true)
    assert picnic_article(Picnic.cart(), "s2002") == nil
  end

  test "mapping adopts the live cart quantity, not a stale cached one" do
    gist = insert!(:ingredient, name: "Gist", supermarket_product_id: 519_017)
    {:ok, _} = Order.set_mode("picnic")

    # The cached cart predates the two s2002 the Picnic app added since.
    HTTPoison.post!(
      "http://localhost:4021/api/15/cart/add_product",
      Jason.encode!(%{product_id: "s2002", count: 2}),
      [{"content-type", "application/json"}]
    )

    assert {:ok, _} =
             Ingredients.edit_ingredient(%{ingredient_id: gist.id, picnic_product_id: "s2002"})

    assert %{quantity: 2} =
             Repo.get_by(Order.ManualIngredient, line_id: "1", ingredient_id: gist.id)
  end

  test "the total price counts every unit of a Picnic cart item" do
    brood =
      insert!(:ingredient,
        name: "Brood",
        supermarket_product_id: 519_017,
        picnic_product_id: "s2001"
      )

    insert!(:manual_ingredient, ingredient_id: brood.id, quantity: 2)

    {:ok, _} = Order.set_mode("picnic")

    assert {:ok, line} = Order.current()
    assert line.total_price == 2 * 189
  end

  test "an unavailable Picnic product adds nothing to the total price" do
    {:ok, _} = Order.set_mode("picnic")

    HTTPoison.post!(
      "http://localhost:4021/__picnic_unavailable",
      Jason.encode!(%{product_id: "s2001"}),
      [{"content-type", "application/json"}]
    )

    Picnic.invalidate_cart()

    assert {:ok, line} = Order.current()
    assert line.total_price == 0
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
