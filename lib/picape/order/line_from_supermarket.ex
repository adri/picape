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

  def convert(cart = %{}) do
    %Line{
      id: 1,
      items: Enum.map(cart["orderedProducts"], fn item -> convert_item(item) end),
      total_count: Enum.count(cart["orderedProducts"]),
      # get from total calculation endpoint
      total_price: cart["price"]["priceAfterDiscount"]
    }
  end

  def convert_item(item = %{}) do
    %Item{
      id: item["product"]["webshopId"],
      name: item["product"]["title"],
      image_url: Supermarket.image_url(item["product"]),
      quantity: item["quantity"]
    }
  end
end
