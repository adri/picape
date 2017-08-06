defmodule Picape.Order do
  import Ecto.Query

  alias Picape.Order.{LineFromSupermarket, PlannedRecipe, ManualIngredient, Sync}
  alias Picape.{Repo, Supermarket, Recipe}

  defmodule Product, do: defstruct [:id, :quantity]

  def current() do
    {:ok, LineFromSupermarket.convert(Supermarket.cart())}
  end

  def plan_recipe(order_id, recipe_id, unplan \\ false) do
    %PlannedRecipe{}
    |> PlannedRecipe.changeset(%{line_id: order_id, recipe_id: recipe_id, unplanned: unplan})
    |> Repo.insert(on_conflict: [set: [unplanned: unplan]], conflict_target: [:line_id, :recipe_id])
    |> case do
      {:ok, planned_recipe} -> sync_supermarket(order_id)
      err -> err
    end
  end

  def planned_recipes(order_id) do
    query = from p in PlannedRecipe,
      where: p.line_id == ^order_id and p.unplanned == false,
      select: p.recipe_id

    {:ok, Repo.all(query)}
  end

  def sync_supermarket(order_id) do
    with {:ok, recipe_quantities} <- recipe_ingredient_quantities(order_id),
         {:ok, planned } <- Recipe.ingredient_quantities(recipe_quantities),
         {:ok, manual } <- manual_ingredients(order_id),
         {:ok, existing } <- ordered_item_quantities(order_id),
         {:ok, changes} <- Sync.changes(planned, manual, existing)
    do
      IO.inspect recipe_quantities, label: "recipe_quantities"
      IO.inspect planned, label: "planned"
      IO.inspect existing, label: "existing"
      IO.inspect changes, label: "changes"

      Supermarket.apply_changes(changes)

      current()
    end
  end

  def ingredients_planned?(order_id, ingredient_ids) do
    with {:ok, recipe_ids} <- planned_recipes(order_id)
    do
      Recipe.ingredients_in_recipes?(recipe_ids, ingredient_ids)
    end
  end

  def ingredients_ordered_quantity(order_id, ingredient_ids) do
    with {:ok, items} <- ordered_item_quantities(order_id),
         {:ok, items_map} <- Recipe.ingredients_by_item_ids(Map.keys(items))
    do
      {:ok, Map.new(ingredient_ids, fn id -> {id, items[items_map[id]] || 0} end)}
    end
  end

  def order_ingredient(order_id, ingredient_id, quantity) do
    %ManualIngredient{}
    |> ManualIngredient.changeset(%{line_id: order_id, ingredient_id: ingredient_id, quantity: quantity})
    |> Repo.insert(on_conflict: [set: [quantity: quantity]], conflict_target: [:line_id, :ingredient_id])
    |> case do
      {:ok, planned_recipe} -> sync_supermarket(order_id)
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

  # --- private

  defp recipe_ingredient_quantities(order_id) do
    query = from p in PlannedRecipe,
      where: p.line_id == ^order_id,
      select: {p.recipe_id, fragment("? * Cast(NOT ? as integer)", p.quantity, p.unplanned)}

    {:ok, Enum.into(Repo.all(query), %{})}
  end

  defp ordered_item_quantities(oder_id) do
    {:ok, order} = current()
    existing = Enum.reduce(order.items, %{}, fn item, acc ->
      Map.update(acc, String.to_integer(item.id), item.quantity, &(&1 + 2))
    end)

    {:ok, existing}
  end

end
