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

  def convert(cart = %{"items" => _list}) do
    %Line{
      id: 1,
      items: Enum.map(cart["items"], fn item -> convert_item(item) end),
      total_count: Enum.count(cart["items"]),
      # get from total calculation endpoint
      total_price: 0
    }
  end

  def convert(cart = %{"orderedProducts" => _list}) do
    %Line{
      id: cart["id"],
      items: Enum.map(cart["orderedProducts"], fn item -> convert_item(item) end),
      total_count: Enum.count(cart["orderedProducts"]),
      total_price: trunc(cart["totalPrice"]["priceAfterDiscount"])
    }
  end

  def convert_item(item = %{"amount" => _amount}) do
    %Item{
      id: item["product"]["webshopId"],
      name: item["product"]["title"],
      image_url: Supermarket.image_url(item["product"]),
      quantity: item["amount"]
    }
  end

  def convert_item(item = %{"quantity" => _quantity}) do
    %Item{
      id: item["product"]["webshopId"],
      name: item["product"]["title"],
      image_url: Supermarket.image_url(item["product"]),
      quantity: item["quantity"]
    }
  end
end
