defmodule Picape.Recipe do
  import Ecto.Query

  alias Picape.Repo
  alias Picape.Supermarket
  alias Picape.Recipe.{Ingredient, Recipe}

  def list_recipes() do
    Repo.all(
      from recipe in Recipe
      # preload: [ingredients: :ingredient]
    )
  end

  def find_by_id(id) do
    Repo.one(where(Recipe, id: ^id))
  end

  def list_essentials() do
    Ingredient
    |> where(is_essential: true)
    |> Repo.all
  end

  def match_supermarket_products() do
    Ingredient
    |> where(is_essential: true)
    |> Repo.all
    |> Enum.map(fn ingredient ->
      ingredient
      |> Ingredient.raw_changeset(%{supermarket_product_raw: Supermarket.products_by_id(ingredient.supermarket_product_id)})
    end)
    |> Enum.map(&Repo.update!/1)
  end
end
