defmodule Picape.Supermarket.AutoMatchIngredients do
  @moduledoc """
  Searches for ingredients in the supermarket and finds
  the best match.
  """
  alias Picape.Supermarket
  alias Picape.Ingredients
  alias Picape.Repo
  alias Picape.Recipe.Ingredient

  @search_suffix " bio"

  def match_all() do
    for ingredient <- Ingredients.list([]),
        details = match_ingredient(ingredient),
        details != false do
      ingredient
      |> Ingredient.raw_changeset(%{
        supermarket_product_id: details["productId"],
        supermarket_product_raw: details
      })
      |> Repo.update()
    end
  end

  defp match_ingredient(ingredient) do
    with {:ok, id} <- search_supermarket_id(ingredient.name),
         details when not is_nil(details) <- Supermarket.products_by_id(id) do
      details
    else
      _ -> false
    end
  end

  defp search_supermarket_id(query) do
    case Supermarket.search(query <> @search_suffix) do
      [] ->
        case Supermarket.search(query) do
          [] -> {:error, :no_match}
          list -> {:ok, List.first(list).id}
        end

      list ->
        {:ok, List.first(list).id}
    end
  end
end
