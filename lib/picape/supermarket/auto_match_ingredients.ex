defmodule Picape.Supermarket.AutoMatchIngredients do
  @moduledoc """
  Searches for ingredients in the supermarket and finds
  the best match.
  """
  alias Picape.Supermarket
  alias Picape.Ingredients
  alias Picape.Repo
  alias Picape.Recipe.Ingredient

  import Ecto.Query

  @search_suffix " bio"

  def match_all() do
    today = ~N(2020-12-27 00:00:00)
    ingredients = from(i in Picape.Recipe.Ingredient, where: i.updated_at < ^today) |> Repo.all()

    for ingredient <- ingredients,
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
    try do
      with {:ok, id} <- search_supermarket_id(ingredient.name),
           details when not is_nil(details) <- Supermarket.products_by_id(id) do
        details
        |> IO.inspect(label: "details")
      else
        _ -> false
      end
    rescue
      _e in Poison.SyntaxError -> match_ingredient(ingredient)
    end
  end

  defp search_supermarket_id(query) do
    case Supermarket.search(query <> @search_suffix) do
      [] ->
        try do
          case Supermarket.search(query) do
            [] -> {:error, :no_match}
            list -> {:ok, List.first(list).id}
          end
        rescue
          _e in Poison.SyntaxError -> {:error, :no_match}
        end

      list ->
        {:ok, List.first(list).id}
        |> IO.inspect(label: "list")
    end
  end
end
