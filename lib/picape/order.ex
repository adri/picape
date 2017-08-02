defmodule Picape.Order do
  import Ecto.Query

  alias Picape.Order.{LineFromSupermarket, PlannedRecipe, Sync}
  alias Picape.{Repo, Supermarket, Recipe}

  defmodule Product, do: defstruct [:id, :quantity]

  def current() do
    {:ok, LineFromSupermarket.convert(Supermarket.cart())}
  end

  def plan_recipe(order_id, recipe_id) do
    changeset = PlannedRecipe.changeset(%PlannedRecipe{}, %{line_id: 1, recipe_id: recipe_id})

    case Repo.insert(changeset) do
      {:error, error} -> {:error, error}
      _ -> sync_supermarket(order_id)
    end
  end

  def unplan_recipe(order_id, recipe_id) do
    query = from p in PlannedRecipe,
      where: p.line_id == ^order_id and p.recipe_id == ^recipe_id

    case Repo.delete(Repo.one(query)) do
      {:error, error} -> {:error, error}
      _ -> sync_supermarket(order_id)
    end
  end

  def planned_recipes(order_id) do
    query = from p in PlannedRecipe, where: p.line_id == ^order_id, select: p.recipe_id

    {:ok, Repo.all(query)}
  end

  def sync_supermarket(order_id) do
    with {:ok, recipe_ids} <- planned_recipes(order_id),
         {:ok, planned } <- Recipe.ingredients_quantity(recipe_ids),
         {:ok, existing } <- ordered_items(order_id),
         {:ok, changes} <- Sync.changes(planned, %{}, existing)
    do
      IO.inspect recipe_ids, label: "recipe_ids"
      IO.inspect planned, label: "planned"
      IO.inspect existing, label: "existing"
      IO.inspect changes, label: "changes"

      Supermarket.apply_changes(changes)
      Supermarket.invalidate_cart()

      current()
    else
      err -> err
    end
  end

  def ordered_items(oder_id) do
    {:ok, order} = current()
    existing = Enum.reduce(order.items, %{}, fn item, acc ->
      Map.update(acc, String.to_integer(item.id), item.quantity, &(&1 + 2))
    end)

    {:ok, existing}
  end

  def ingredients_planned?(order_id, ingredient_ids) do
    with {:ok, recipe_ids} <- planned_recipes(order_id)
    do
      Recipe.ingredients_in_recipes?(recipe_ids, ingredient_ids)
    else
      err -> err
    end
  end

  def ingredients_ordered_quantity(order_id, ingredient_ids) do
    with {:ok, items} <- ordered_items(order_id),
         {:ok, items_map} <- Recipe.ingredients_by_item_ids(Map.keys(items))
    do
      {:ok, Map.new(ingredient_ids, fn id -> {id, items[items_map[id]] || 0} end)}
    else
      err -> err
    end
  end
end
