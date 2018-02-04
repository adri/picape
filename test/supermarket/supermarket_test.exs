defmodule Picape.SupermarketTest do
  use ExUnit.Case
  alias Picape.Supermarket

  test "it returns latest order id from order being delivered" do
    orders =
      Poison.decode!("""
      {
          "current_orders": [{ "order_id": "12345" }],
          "orders": []
      }
      """)

    assert "12345" == Supermarket.latest_order_id(orders)
  end

  test "it returns latest order id from delivered orders" do
    orders =
      Poison.decode!("""
      {
          "current_orders": [],
          "orders": [ { "order_id": "56789" } ]
      }
      """)

    assert "56789" == Supermarket.latest_order_id(orders)
  end

  test "it returns latest order id from current order, ignoring delivered" do
    orders =
      Poison.decode!("""
      {
          "current_orders": [{ "order_id": "12345" }],
          "orders": [ { "order_id": "5678" } ]
      }
      """)

    assert "12345" == Supermarket.latest_order_id(orders)
  end

  test "it returns nil when there are no oders" do
    assert nil == Supermarket.latest_order_id(%{})
  end
end
