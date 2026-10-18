defmodule Picape.Order.LineFromPicnic do
  @moduledoc """
  Converts the Picnic cart into an order line. The cart's `items` are
  ORDER_LINE groups that each hold ORDER_ARTICLEs — flattened into items
  whose `id` is the Picnic selling unit id, like `s1002987`.
  """
  alias Picape.Order.{Line, Item}
  alias Picape.Picnic

  def convert(%{"items" => groups} = _cart) when is_list(groups) do
    articles = Enum.flat_map(groups, &(&1["items"] || []))
    items = Enum.map(articles, &convert_item/1)

    # The totals come from the articles themselves, not the cart's stored
    # totals: a cached cart can hold a total that no longer matches its items.
    %Line{
      id: 1,
      items: items,
      total_count: Enum.sum(Enum.map(items, & &1.quantity)),
      total_price: Enum.sum(Enum.map(articles, &((&1["price"] || 0) * quantity(&1)))),
      total_discount: 0,
      is_placed: false
    }
  end

  def convert(_cart) do
    %Line{id: 1, items: [], total_count: 0, total_price: 0, total_discount: 0, is_placed: false}
  end

  defp convert_item(item = %{}) do
    %Item{
      id: item["id"],
      name: item["name"],
      image_url: Picnic.image_url(List.first(item["image_ids"] || [])),
      quantity: quantity(item),
      store: "picnic"
    }
  end

  # The article's quantity sits in a QUANTITY decorator, the same spot the
  # pre-v15 API kept it.
  defp quantity(item) do
    Enum.find(item["decorators"] || [], %{"quantity" => 0}, fn dec -> dec["type"] == "QUANTITY" end)[
      "quantity"
    ]
  end
end
