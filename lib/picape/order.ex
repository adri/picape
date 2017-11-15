defmodule Picape.Order do
  import Ecto.Query

  alias Picape.Order.{LineFromSupermarket, PlannedRecipe, ManualIngredient, Sync}
  alias Picape.{Repo, Supermarket, Recipe}

  defmodule Product, do: defstruct [:id, :quantity]

  @doc """
  Returns the currently active cart.
  """
  def current() do
    {:ok, LineFromSupermarket.convert(Supermarket.cart())}
  end

  @doc """
  Plans or unplans (unplan = true) a recipe.
  """
  def plan_recipe(order_id, recipe_id, unplan \\ false) do
    %PlannedRecipe{}
    |> PlannedRecipe.changeset(%{line_id: order_id, recipe_id: recipe_id, unplanned: unplan})
    |> Repo.insert(on_conflict: [set: [unplanned: unplan]], conflict_target: [:line_id, :recipe_id])
    |> case do
      {:ok, recipe} -> {:ok, recipe}
      err -> err
    end
  end

  @doc """
  Returns a list of planned recipe IDs.
  """
  def planned_recipes(order_id) do
    query = from p in PlannedRecipe,
      where: p.line_id == ^order_id and p.unplanned == false,
      select: p.recipe_id

    {:ok, Repo.all(query)}
  end

  @doc """
  Synchronizes planned ingredients with the cart on Supermarket.
  """
  def sync_supermarket(order_id) do
    ensure_order_is_current(order_id)
    with {:ok, recipe_quantities} <- recipe_ingredient_quantities(order_id),
         {:ok, planned} <- Recipe.item_quantities(recipe_quantities),
         {:ok, manual} <- manual_ingredients(order_id),
         {:ok, existing} <- ordered_item_quantities(order_id),
         {:ok, changes} <- Sync.changes(planned, manual, existing)
    do
      IO.inspect recipe_quantities, label: "recipe_quantities"
      IO.inspect planned, label: "planned"
      IO.inspect manual, label: "manual"
      IO.inspect existing, label: "existing"
      IO.inspect changes, label: "changes"

      Supermarket.apply_changes(changes)

      current()
    end
  end

  @doc """
  Returns a map of ingredient IDs to a boolean if that recipe was planned or not.
  """
  def ingredients_planned?(order_id, ingredient_ids) do
    with {:ok, recipe_ids} <- planned_recipes(order_id)
    do
      Recipe.ingredients_in_recipes?(recipe_ids, ingredient_ids)
    end
  end

  def ingredients_ordered_quantity(order_id, ingredient_ids) do
    with {:ok, items} <- ordered_item_quantities(order_id),
         {:ok, items_map} <- Recipe.ingredients_by_item_ids_reverse(Map.keys(items))
    do
      {:ok, Map.new(ingredient_ids, fn id -> {id, items[items_map[id]] || 0} end)}
    end
  end

  def order_ingredient(order_id, ingredient_id, quantity) do
    %ManualIngredient{}
    |> ManualIngredient.changeset(%{line_id: order_id, ingredient_id: ingredient_id, quantity: quantity})
    |> Repo.insert(on_conflict: [set: [quantity: quantity]], conflict_target: [:line_id, :ingredient_id])
    |> case do
      {:ok, _planned_recipe} -> sync_supermarket(order_id)
      err -> err
    end
  end

  def manual_ingredients(order_id) do
     query = from m in ManualIngredient,
       join: i in assoc(m, :ingredient),
       where: m.line_id == ^order_id,
       select: {i.supermarket_product_id, m.quantity}

     {:ok, Enum.into(Repo.all(query), %{})}
  end

  def recipes_planned_for_ingredient_ids(order_id, ingredient_ids) do
    with {:ok, planned_recipe_ids} <- planned_recipes(order_id),
         {:ok, recipes_by_ingredients} <- Recipe.recipes_by_ingredient_ids(ingredient_ids, planned_recipe_ids)
    do
      {:ok, recipes_by_ingredients}
    end
  end

  def last_order_id() do
    Supermarket.latest_order_id(Supermarket.orders())
  end

  # --- private

  defp ensure_order_is_current(order_id) do
    with latest_order_id <- last_order_id(),
         false <- planned_items_in_order?(latest_order_id)
    do
      (from p in PlannedRecipe, where: p.line_id == ^order_id)
      |> Repo.update_all(set: [line_id: latest_order_id])
      (from i in ManualIngredient, where: i.line_id == ^order_id)
      |> Repo.update_all(set: [line_id: latest_order_id])
    end
  end

  defp planned_items_in_order?(order_id) do
    with [] <- Repo.all(from p in PlannedRecipe, where: p.line_id == ^order_id, limit: 1),
         [] <- Repo.all(from m in ManualIngredient, where: m.line_id == ^order_id, limit: 1)
    do
      false
    else
      _ -> true
    end
  end

  defp recipe_ingredient_quantities(order_id) do
    query = from p in PlannedRecipe,
      where: p.line_id == ^order_id,
      select: {p.recipe_id, fragment("? * Cast(NOT ? as integer)", p.quantity, p.unplanned)}

    {:ok, Enum.into(Repo.all(query), %{})}
  end

  defp ordered_item_quantities(_order_id) do
    {:ok, order} = current()
    existing = Enum.reduce(order.items, %{}, fn item, acc ->
      Map.update(acc, item.id, item.quantity, &(&1 + 2))
    end)

    {:ok, existing}
  end

end
