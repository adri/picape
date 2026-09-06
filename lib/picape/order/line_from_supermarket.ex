defmodule Picape.Order.LineFromSupermarket do
  alias Picape.Order.{Line, Item}
  alias Picape.Supermarket

  def convert(_cart = %{"error" => %{}}) do
    %Line{
      id: 1,
      items: [],
      total_count: 0,
      total_price: 0,
      total_discount: 0
    }
  end

  def convert(cart = %{"items" => _list, "basket" => basket}) when is_map(basket) do
    items = Enum.map(cart["items"], &convert_item/1)
    summary = basket["summary"] || %{}
    price = get_in(summary, ["price", "priceAfterDiscount", "amount"]) || 0
    discount = get_in(summary, ["price", "discount", "amount"]) || 0
    # Nobody has a slot until they book one, so an order without a delivery is
    # the normal first-time state and not an error.
    delivery = get_in(cart, ["order", "delivery"]) || %{}

    %Line{
      id: 1,
      items: items,
      total_count: summary["quantity"] || Enum.count(items),
      total_price: cents(price),
      total_discount: cents(discount),
      delivery_date: delivery["date"],
      delivery_start_time: delivery["startTime"],
      delivery_end_time: delivery["endTime"]
    }
  end

  def convert(cart = %{"items" => _list}) do
    items = Enum.map(cart["items"], &convert_item/1)

    %Line{
      id: 1,
      items: items,
      total_count: Enum.count(items),
      total_price: 0,
      total_discount: 0
    }
  end

  def convert_item(item = %{"product" => %{"id" => _}}) do
    product = item["product"]

    %Item{
      id: product["id"],
      name: product["title"],
      image_url: Supermarket.image_url(product),
      quantity: item["quantity"]
    }
  end

  # The supermarket reports money in euros with a fractional part. Truncating
  # that to whole euros dropped the cents the cart heading has to show.
  defp cents(amount), do: round(amount * 100)
end
