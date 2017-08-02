defmodule Picape.Recipe do
  import Ecto.Query

  alias Picape.Repo
  alias Picape.Supermarket
  alias Picape.Recipe.{Ingredient, IngredientRef, Recipe}

  def list_recipes() do
    Repo.all(
      from recipe in Recipe
      # preload: [ingredients: :ingredient]
    )
  end

  def find_by_id(id) do
    case Repo.one(where(Recipe, id: ^id)) do
      nil -> {:error, :recipe_not_found}
      recipe -> {:ok, recipe}
    end
  end

  def essentials_quantity(recipe_ids) do
    ingredients_quantity(recipe_ids, true)
  end

  def ingredients_quantity(recipe_ids, essentials \\ false) do
    query = from r in IngredientRef,
        join: i in assoc(r, :ingredient),
        where: r.recipe_id in ^recipe_ids and
               i.is_essential == ^essentials,
        group_by: r.ingredient_id,
        select: {r.ingredient_id, sum(r.quantity)}

    Repo.all(query)
    |> Enum.into(%{})
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
