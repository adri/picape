defmodule Picape.Recipe do
  import Ecto.Query

  alias Picape.Repo
  alias Picape.Recipe.{Ingredient, IngredientRef, Recipe}

  def list_recipes() do
    Repo.all(from(r in Recipe, order_by: [:title]))
  end

  def recipes_by_ids(ids) when is_list(ids) do
    result =
      from(r in Recipe, where: r.id in ^ids)
      |> Repo.all()
      |> Map.new(fn recipe -> {recipe.id, recipe} end)

    {:ok, result}
  end

  def recipes_by_ids(_) do
    {:ok, %{}}
  end

  @doc """
  Returns a map of items and their quantities needed
  for the specified map of recipes and their quantities.

  This excludes essentials.
  """
  def item_quantities(recipes_quantities) do
    quantities_by(recipes_quantities, :supermarket_product_id)
  end

  @doc """
  Like `item_quantities/1` but keyed by ingredient id, so an ingredient
  without a supermarket product still counts.
  """
  def ingredient_quantities(recipes_quantities) do
    quantities_by(recipes_quantities, :id)
  end

  # An ingredient without a product under the chosen key is left out: there
  # is nothing to order it by.
  defp quantities_by(recipes_quantities, key) do
    query =
      from(
        r in IngredientRef,
        join: i in assoc(r, :ingredient),
        where:
          r.recipe_id in ^Map.keys(recipes_quantities) and i.is_essential == false and
            not is_nil(field(i, ^key)),
        select: {field(i, ^key), {r.recipe_id, r.quantity}}
      )

    result =
      Repo.all(query)
      |> Enum.reduce(%{}, fn {id, {recipe_id, quantity}}, item_quantities ->
        Map.merge(
          item_quantities,
          %{id => recipes_quantities[recipe_id] * quantity},
          fn _id, quantity1, quantity2 ->
            quantity1 + quantity2
          end
        )
      end)

    {:ok, result}
  end

  def ingredients_by_item_ids(item_ids) do
    by_product =
      from(
        i in Ingredient,
        preload: [:tags],
        where: i.supermarket_product_id in ^item_ids,
        select: {i.supermarket_product_id, i}
      )
      |> Repo.all()
      |> Enum.into(%{})

    # A checklist item can be keyed by ingredient id when the ingredient has
    # no product at all. Only ids no product claimed try that lookup, so an
    # ingredient id never wins over a product id that happens to match.
    by_ingredient =
      case Enum.filter(item_ids -- Map.keys(by_product), &is_integer/1) do
        [] ->
          %{}

        ids ->
          from(i in Ingredient, preload: [:tags], where: i.id in ^ids, select: {i.id, i})
          |> Repo.all()
          |> Enum.into(%{})
      end

    {:ok, Map.merge(by_product, by_ingredient)}
  end

  def ingredients_by_item_ids_reverse(item_ids) do
    {:ok, ingredients} = ingredients_by_item_ids(item_ids)
    ids = Map.new(ingredients, fn {k, ingredient} -> {k, ingredient.id} end)

    {:ok, Map.new(item_ids, fn item_id -> {ids[item_id], item_id} end)}
  end

  def ingredients_by_recipe_ids(recipe_ids) do
    defaults = Map.new(recipe_ids, fn id -> {id, []} end)

    result =
      Repo.all(
        from(
          ref in IngredientRef,
          where: ref.recipe_id in ^recipe_ids,
          join: i in assoc(ref, :ingredient),
          select: {ref.recipe_id, ref},
          preload: [:ingredient]
        )
      )
      |> Enum.group_by(fn {k, _} -> k end, fn {_, v} -> v end)
      |> Map.merge(defaults, fn _k, v, _v2 -> v end)

    {:ok, result}
  end

  def recipes_by_ingredient_ids(ingredient_ids, recipe_ids) do
    result =
      Repo.all(
        from(
          ref in IngredientRef,
          where: ref.recipe_id in ^recipe_ids and ref.ingredient_id in ^ingredient_ids,
          join: r in assoc(ref, :recipe),
          select: {ref.ingredient_id, ref},
          preload: [:recipe]
        )
      )
      |> Enum.group_by(fn {k, _} -> k end, fn {_, v} -> v end)

    {:ok, result}
  end

  @doc """
  Returns if each ingredient that is in one of the specified recipes.
  """
  def ingredients_in_recipes?(recipe_ids, ingredient_ids) do
    ids =
      Repo.all(
        from(
          r in IngredientRef,
          where: r.recipe_id in ^recipe_ids and r.ingredient_id in ^ingredient_ids,
          select: r.ingredient_id
        )
      )

    {:ok, Map.new(ingredient_ids, fn id -> {id, Enum.member?(ids, id)} end)}
  end

  def list_essentials() do
    Ingredient
    |> where(is_essential: true)
    |> Repo.all()
  end

  def add_recipe(params) do
    %Recipe{}
    |> Recipe.add_changeset(params)
    |> Repo.insert()
  end

  def edit_recipe(params) do
    Repo.get(Recipe, params[:id])
    |> Repo.preload(:ingredients)
    |> Recipe.edit_changeset(params)
    |> Repo.update()
  end
end
