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
         {:ok, existing } <- existing_ingredients(order_id),
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
      err ->
        IO.inspect err
        err
    end
  end

  def existing_ingredients(oder_id) do
    {:ok, cart} = current()
    existing = Enum.reduce(cart.items, %{}, fn item, acc ->
      Map.update(acc, String.to_integer(item.id), item.quantity, &(&1 + 2))
    end)

    {:ok, existing}
  end

  # List all supermarket products
  # List all planned recipes
  # - get their ingredients

  # ingredients
  # - filter deleted
  # - filter
  # Recipe.list_essentials()

end
