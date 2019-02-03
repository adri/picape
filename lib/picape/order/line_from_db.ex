defmodule Picape.Order.LineFromDb do
  alias Picape.Order.{Line, Item}
  alias Picape.Supermarket

  @empty %Line{
    id: 1,
    items: [],
    total_count: 0,
    total_price: 0,
  }

  def convert(nil), do: @empty
  def convert(cart) when cart == %{}, do: @empty
  def convert(cart) do
    %Line{
      id: 1,
      items:
        Enum.map(Map.values(cart), fn item ->
          convert_item(item)
        end),
      total_count: map_size(cart),
      total_price: 0,
    }
  end

  def convert_item(item = %{}) do
    %Item{
      id: item.id,
      name: item.ingredient.name,
      image_url: Supermarket.image_url(item.ingredient.supermarket_product_raw["product_details"]["image_id"]),
      quantity: item.quantity,
    }
  end
end
