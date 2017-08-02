defmodule Picape.Order do

  alias Picape.Order.{LineFromSupermarket, PlannedRecipe}
  alias Picape.{Repo, Supermarket, Recipe}

  defmodule Product, do: defstruct [:id, :quantity]

  def plan_recipe(recipe_id) do
    with {:ok, recipe} <- Recipe.find_by_id(recipe_id),
         {:ok, order} <- current()
    do
      %PlannedRecipe{}
      |> PlannedRecipe.changeset(%{line_id: order.id, recipe_id: recipe_id})
      |> Repo.insert!

      current()
    else
      err -> err
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
