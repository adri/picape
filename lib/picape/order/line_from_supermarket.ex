defmodule Picape.Order.LineFromSupermarket do

  alias Picape.Order.{Line, Item}
  alias Picape.Supermarket

  def convert(cart = %{}) do
    %Line{
      id: 1,
      items: Enum.map(cart["items"], fn line -> convert_item(List.first(line["items"])) end),
      total_count: cart["total_count"],
      total_price: cart["total_price"],
    }
  end

  def convert_item(item = %{}) do
    %Item{
      id: item["id"],
      name: item["name"],
      image_url: Supermarket.image_url(List.first(item["image_ids"])),
      quantity: Enum.find(
          item["decorators"],
          %{"quantity" => 0},
          fn dec -> dec["type"] === "QUANTITY" end
      )["quantity"]
    }
  end

end
