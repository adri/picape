defmodule Picape.PicnicTest do
  use Picape.DataCase

  alias Picape.Order.Sync
  alias Picape.Picnic

  test "search returns the selling units the page carries" do
    assert [
             %{id: "s2001", name: "Volkoren brood", price: 189, unit_quantity: "800 g"},
             %{id: "s2002", name: "Halfvolle melk", price: 119, unit_quantity: "1 l"}
           ] = Picnic.search("brood")
  end

  test "search with an empty query asks nothing" do
    assert Picnic.search("") == []
  end

  test "cart reads the order Picnic reports" do
    cart = Picnic.cart()

    assert cart["total_count"] == 1
    assert cart["total_price"] == 189
    assert picnic_quantity(cart, "s2001") == 1
  end

  test "add_product and remove_product move selling units in and out" do
    cart = Picnic.add_product("s2002", 3)
    assert picnic_quantity(cart, "s2002") == 3

    cart = Picnic.remove_product("s2002", 1)
    assert picnic_quantity(cart, "s2002") == 2

    cart = Picnic.remove_product("s2002", 2)
    assert picnic_article(cart, "s2002") == nil
  end

  test "add_product returns and caches the whole cart" do
    cart = Picnic.add_product("s2002", 1)

    assert Picnic.cart() == cart
  end

  test "apply_changes posts the deltas a target-quantity diff asks for" do
    {:ok, changes} = Sync.changes(%{"s2001" => 3, "s2002" => 1}, %{}, %{"s2001" => 1})

    assert {:ok, :synced} = Picnic.apply_changes(changes, %{"s2001" => 1})

    cart = Picnic.cart()
    assert picnic_quantity(cart, "s2001") == 3
    assert picnic_quantity(cart, "s2002") == 1
  end

  test "apply_changes removes down to the wanted quantity" do
    {:ok, changes} = Sync.changes(%{}, %{"s2001" => 0}, %{"s2001" => 1})

    assert {:ok, :synced} = Picnic.apply_changes(changes, %{"s2001" => 1})

    assert picnic_article(Picnic.cart(), "s2001") == nil
  end

  test "a dead Picnic raises the shared supermarket error" do
    HTTPoison.post!("http://localhost:4021/__down", "")
    Picnic.invalidate_cart()

    error = assert_raise Picape.Supermarket.Error, fn -> Picnic.cart() end
    assert error.message =~ "503"
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
end
