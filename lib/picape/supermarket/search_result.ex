defmodule Picape.Supermarket.SearchResult do
  use Ecto.Schema
  alias Picape.Supermarket.SearchResult
  alias Picape.Supermarket

  schema "supermarket_search_result" do
    field(:name, :string)
    field(:price, :string)
    field(:image_url, :string)
    field(:unit_quantity, :string)
  end

  def from_result(search_result) do
    search_result["products"]
    |> Enum.filter(&(&1["availableOnline"] == true))
    |> Enum.map(&convert(&1))
  end

  def convert(item = %{}) do
    %SearchResult{
      id: item["webshopId"],
      name: item["title"],
      price: item["priceBeforeBonus"],
      image_url: Supermarket.image_url(item),
      unit_quantity: item["salesUnitSize"]
    }
  end
end
