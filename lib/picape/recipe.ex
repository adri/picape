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

  def ingredients_quantity(recipe_ids) do
    query = from r in IngredientRef,
        join: i in assoc(r, :ingredient),
        where: r.recipe_id in ^recipe_ids and
               i.is_essential == false,
        group_by: i.supermarket_product_id,
        select: {i.supermarket_product_id, sum(r.quantity)}

     {:ok, Enum.into(Repo.all(query), %{})}
  end

  @doc """
  Returns if each ingredient is in one of the specified recipes.
  """
  def ingredients_in_recipes?(recipe_ids, ingredient_ids) do
    ids = Repo.all from r in IngredientRef,
       where: r.recipe_id in ^recipe_ids and
              r.ingredient_id in ^ingredient_ids,
       select: r.ingredient_id

    {:ok, Map.new(ingredient_ids, fn id -> {id, Enum.member?(ids, id)} end)}
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
