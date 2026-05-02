defmodule Picape.Order.LineFromSupermarket do
  alias Picape.Order.{Line, Item}
  alias Picape.Supermarket

  def convert(_cart = %{"error" => %{}}) do
    %Line{
      id: 1,
      items: [],
      total_count: 0,
      total_price: 0
    }
  end

  def convert(cart = %{"items" => _list, "basket" => basket}) when is_map(basket) do
    items = Enum.map(cart["items"], &convert_item/1)
    summary = basket["summary"] || %{}
    price = get_in(summary, ["price", "priceAfterDiscount", "amount"]) || 0

    %Line{
      id: 1,
      items: items,
      total_count: summary["quantity"] || Enum.count(items),
      total_price: trunc(price)
    }
  end

  def convert(cart = %{"items" => _list}) do
    items = Enum.map(cart["items"], &convert_item/1)

    %Line{
      id: 1,
      items: items,
      total_count: Enum.count(items),
      total_price: 0
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
end
