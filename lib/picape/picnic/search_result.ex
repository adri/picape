defmodule Picape.Picnic.SearchResult do
  @moduledoc """
  One `sellingUnit` from a Picnic search page, normalised to the small shape
  the tools and the ingredient cache read. `price` is `display_price`, cents.
  """

  defstruct [:id, :name, :price, :unit_quantity, :image_id, :max_count]

  alias Picape.Picnic.SearchResult

  def from_result(page) when is_map(page) do
    page |> selling_units() |> Enum.map(&convert/1)
  end

  def from_result(_), do: []

  # Every `sellingUnit` value anywhere in the page tree — the JSONPath
  # `$..sellingUnit` the other Picnic clients extract.
  defp selling_units(node) when is_map(node) do
    Enum.flat_map(node, fn
      {"sellingUnit", %{} = unit} -> [unit | selling_units(unit)]
      {"sellingUnit", _} -> []
      {_key, value} -> selling_units(value)
    end)
  end

  defp selling_units(list) when is_list(list), do: Enum.flat_map(list, &selling_units/1)

  defp selling_units(_), do: []

  defp convert(unit = %{}) do
    %SearchResult{
      id: unit["id"],
      name: unit["name"],
      price: unit["display_price"] || price_range(unit["price_ranges"]),
      unit_quantity: unit["unit_quantity"],
      image_id: unit["image_id"],
      max_count: unit["max_count"]
    }
  end

  # Promotional tiles carry price_ranges instead of display_price: a list of
  # {price, from_quantity} tiers. The earliest tier is the per-piece price.
  defp price_range([_ | _] = ranges) do
    ranges |> Enum.min_by(&(&1["from_quantity"] || 0)) |> Map.get("price")
  end

  defp price_range(_), do: nil
end
