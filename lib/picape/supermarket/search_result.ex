defmodule Picape.Supermarket.SearchResult do
  use Ecto.Schema
  alias Picape.Supermarket.SearchResult
  alias Picape.Supermarket

  schema "supermarket_search_result" do
    field :name, :string
    field :price, :string
    field :image_url, :string
    field :unit_quantity, :string
  end

  def from_result(search_result) do
    List.first(search_result)["items"]
    |> Enum.map(&convert(&1))
  end

  def convert(item = %{}) do
    %SearchResult{
      id: item["id"],
      name: item["name"],
      price: item["price"],
      image_url: Supermarket.image_url(item["image_id"]),
      unit_quantity: item["unit_quantity"],
    }
  end
end
