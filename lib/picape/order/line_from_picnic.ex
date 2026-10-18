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
    # An ORDER_ARTICLE's price is per unit; one Picnic cannot sell right now
    # adds nothing to what the order would cost.
    %Line{
      id: 1,
      items: items,
      total_count: Enum.sum(Enum.map(items, & &1.quantity)),
      total_price:
        articles
        |> Enum.reject(&unavailability/1)
        |> Enum.map(&((&1["price"] || 0) * quantity(&1)))
        |> Enum.sum(),
      total_discount: 0,
      is_placed: false
    }
  end

  def convert(_cart) do
    %Line{id: 1, items: [], total_count: 0, total_price: 0, total_discount: 0, is_placed: false}
  end

  defp convert_item(item = %{}) do
    unavailability = unavailability(item)

    %Item{
      id: item["id"],
      name: item["name"],
      image_url: Picnic.image_url(List.first(item["image_ids"] || [])),
      quantity: quantity(item),
      is_orderable: is_nil(unavailability),
      availability_label: unavailability["text"] || unavailability["reason"],
      store: "picnic"
    }
  end

  # An ORDER_ARTICLE the store cannot sell right now carries an UNAVAILABLE
  # decorator — Picnic's own verdict, like isOrderable on the supermarket side.
  defp unavailability(item) do
    Enum.find(item["decorators"] || [], &(&1["type"] == "UNAVAILABLE"))
  end

  # The article's quantity sits in a QUANTITY decorator, the same spot the
  # pre-v15 API kept it.
  defp quantity(item) do
    Enum.find(item["decorators"] || [], %{"quantity" => 0}, fn dec -> dec["type"] == "QUANTITY" end)[
      "quantity"
    ]
  end
end
