defmodule Picape.ChecklistModeTest do
  use Picape.DataCase

  alias Picape.{Checklist, Order, Settings, Supermarket}

  @fake "http://localhost:4021"

  test "checklist mode reads the computed list without touching the supermarket" do
    rijst = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)
    insert!(:manual_ingredient, ingredient_id: rijst.id, quantity: 2)

    to_checklist()
    supermarket_down()

    assert {:ok, line} = Order.current()
    assert [%{name: "Rijst", quantity: 2, checked: false}] = line.items
    assert line.is_placed == false
  end

  test "planning and ordering keep working while the supermarket is down" do
    rijst = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)
    recipe = insert!(:recipe, title: "Nasi", ingredients: [rijst])
    melk = insert!(:ingredient, name: "Melk", supermarket_product_id: 999_999)

    to_checklist()
    supermarket_down()

    assert {:ok, _} = Order.plan_recipe("1", recipe.id)
    assert {:ok, _} = Order.order_ingredient("1", melk.id, 3)

    assert {:ok, line} = Order.current()
    assert Enum.map(line.items, & &1.name) |> Enum.sort() == ["Melk", "Rijst"]
  end

  test "items tick off and untick again" do
    rijst = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)
    insert!(:manual_ingredient, ingredient_id: rijst.id, quantity: 1)

    to_checklist()

    assert {:ok, _} = Checklist.check(rijst.id, true)
    assert {:ok, line} = Order.current()
    assert [%{name: "Rijst", checked: true}] = line.items

    assert {:ok, _} = Checklist.check(rijst.id, false)
    assert {:ok, line} = Order.current()
    assert [%{checked: false}] = line.items
  end

  test "ticking is refused outside checklist mode" do
    rijst = insert!(:ingredient, name: "Rijst")

    assert {:error, message} = Checklist.check(rijst.id, true)
    assert message =~ "checklist"
    assert Checklist.checked_ids() == MapSet.new()
  end

  test "closing the order clears the ticks" do
    rijst = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)
    insert!(:manual_ingredient, ingredient_id: rijst.id, quantity: 1)

    to_checklist()
    {:ok, _} = Checklist.check(rijst.id, true)

    {:ok, _last} = Order.start_shopping("1")

    assert Checklist.checked_ids() == MapSet.new()
    assert Settings.mode() == "checklist"
  end

  test "switching back to the supermarket pushes the accumulated list" do
    rijst = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)
    melk = insert!(:ingredient, name: "Melk", supermarket_product_id: 999_999)

    to_checklist()
    {:ok, _} = Order.order_ingredient("1", rijst.id, 2)
    {:ok, _} = Order.order_ingredient("1", melk.id, 1)

    assert {:ok, %{mode: "ah", pushed_to_supermarket: true}} = Order.set_mode("ah")

    Supermarket.invalidate_cart()
    cart = Supermarket.cart()
    assert product_quantity(cart, 10_583_837) == 2
    assert product_quantity(cart, 999_999) == 1
  end

  test "switching back while the supermarket is still down switches anyway" do
    to_checklist()
    supermarket_down()

    assert {:ok, %{mode: "ah", pushed_to_supermarket: false, error: error}} = Order.set_mode("ah")
    assert error =~ "503"
    assert Settings.mode() == "ah"
  end

  test "an unknown mode is an error and changes nothing" do
    assert {:error, _} = Order.set_mode("floef")
    assert Settings.mode() == "ah"
  end

  test "a non-JSON answer is a clear error" do
    supermarket_down()

    error = assert_raise Picape.Supermarket.Error, fn -> Supermarket.cart() end
    assert error.message =~ "503"
    assert error.message =~ "non-JSON"
  end

  defp to_checklist() do
    assert {:ok, %{mode: "checklist"}} = Order.set_mode("checklist")
  end

  defp supermarket_down() do
    HTTPoison.post!(@fake <> "/__down", "")
    Supermarket.invalidate_cart()
    Supermarket.invalidate_orders()
  end

  defp product_quantity(cart, product_id) do
    Enum.find_value(cart["items"], fn
      %{"product" => %{"id" => ^product_id}, "quantity" => quantity} -> quantity
      _ -> nil
    end)
  end
end
