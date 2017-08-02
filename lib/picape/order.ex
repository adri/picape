defmodule Picape.Order do
  import Ecto.Query

  alias Picape.Order.{LineFromSupermarket, PlannedRecipe, Sync}
  alias Picape.{Repo, Supermarket, Recipe}

  defmodule Product, do: defstruct [:id, :quantity]

  def plan_recipe(recipe_id) do
    planned = %PlannedRecipe{}
      |> PlannedRecipe.changeset(%{line_id: 1, recipe_id: recipe_id})
      |> Repo.insert

    case planned do
      {:error, error} -> {:error, error}
      _ -> current()
    end
  end

  def planned_recipes(order_id) do
    Repo.all(from p in PlannedRecipe, where: p.line_id == ^order_id, select: p.recipe_id)
  end

  def sync_supermarket(order_id) do
    with recipe_ids <- planned_recipes(order_id),
         planned <- Recipe.ingredients_quantity(recipe_ids)
    do
      Sync.changes(planned, %{}, %{})
      |> IO.inspect
    end
  end

  def current() do
    order = Supermarket.cart()
    |> LineFromSupermarket.convert

    {:ok, order}
  end

  # List all supermarket products
  # List all planned recipes
  # - get their ingredients

  # ingredients
  # - filter deleted
  # - filter
  # Recipe.list_essentials()

end
