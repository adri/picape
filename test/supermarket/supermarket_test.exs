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

  # The renditions arrive biggest first, so a selection that reads the list in
  # order looks right whichever end it takes. These are shuffled to catch that.
  @images [
    %{"width" => 200, "height" => 200, "url" => "https://static/200"},
    %{"width" => 800, "height" => 800, "url" => "https://static/800"},
    %{"width" => 48, "height" => 48, "url" => "https://static/48"},
    %{"width" => 80, "height" => 80, "url" => "https://static/80"}
  ]

  test "it takes the biggest rendition for a large image" do
    assert "https://static/800" == Supermarket.large_image_url(%{"images" => @images})
  end

  test "it keeps taking a row-sized rendition for a small image" do
    assert "https://static/80" == Supermarket.image_url(%{"images" => @images})
  end

  test "it falls back to the small image when a product card has no images" do
    assert Supermarket.large_image_url(%{"images" => []}) == Supermarket.image_url(%{"images" => []})
  end
end
