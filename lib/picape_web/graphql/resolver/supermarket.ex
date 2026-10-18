defmodule PicapeWeb.Graphql.Resolver.Supermarket do
  alias Picape.{Picnic, Supermarket}

  def search(_parent, attributes, _info) do
    {:ok, Supermarket.search(attributes[:query])}
  rescue
    _ -> {:error, "the supermarket is unreachable"}
  end

  # Picnic sells in "selling units" with s-prefixed ids; the search result type
  # is shared, with the image built from the image_id the tile carries.
  def search_picnic(_parent, attributes, _info) do
    results =
      attributes[:query]
      |> Picnic.search()
      |> Enum.map(
        &%{
          id: &1.id,
          name: &1.name,
          price: &1.price,
          unit_quantity: &1.unit_quantity,
          image_url: Picnic.image_url(&1.image_id)
        }
      )

    {:ok, results}
  rescue
    _ -> {:error, "the supermarket is unreachable"}
  end
end
