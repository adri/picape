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

  @doc """
  Returns a map of ingredients and their quantities needed
  for the specified map of recipes and their quantities.

  This excludes essentials.
  """
  def ingredient_quantities(recipes_quantities) do
    query = from r in IngredientRef,
      join: i in assoc(r, :ingredient),
      where: r.recipe_id in ^Map.keys(recipes_quantities) and
             i.is_essential == false,
      select: {i.supermarket_product_id, {r.recipe_id, r.quantity}}

    result = Repo.all(query)
    |> Enum.map(fn ({id, {recipe_id, quantity}}) ->
       {id, recipes_quantities[recipe_id] * quantity}
    end)
    |> Enum.into(%{})

    {:ok, result}
  end

  def ingredients_by_item_ids(item_ids) do
    query = from i in Ingredient,
      where: i.supermarket_product_id in ^item_ids,
      select: {i.supermarket_product_id, i.id}

    ids = Enum.into(Repo.all(query), %{})

    {:ok, Map.new(item_ids, fn item_id -> {ids[item_id], item_id} end)}
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

  def add_ingredient(params) do
    %Ingredient{}
    |> Ingredient.changeset(Map.put(params, :supermarket_product_raw, Supermarket.products_by_id(params[:supermarket_product_id])))
    |> Repo.insert
  end

  def match_supermarket_products() do
    Ingredient
    |> Repo.all
    |> Enum.map(fn ingredient ->
      ingredient
      |> Ingredient.raw_changeset(%{supermarket_product_raw: Supermarket.products_by_id(ingredient.supermarket_product_id)})
    end)
    |> Enum.map(&Repo.update!/1)
  end
end
