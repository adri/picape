defmodule Picape.Order do
  alias Picape.Order.{LineFromSupermarket}
  alias Picape.{Supermarket, Recipe}

  defmodule Product, do: defstruct [:id, :quantity]

  def plan_recipe(recipe_id) do
    {:ok, current()}
#    with recipe <- Recipe.find_by_id(recipe_id)
#    do
#      {:ok, recipe}
#    else
#      {:error, err} -> {:error, err}
#    end
  end

  def sync_supermarket() do
    current()
  end

  def current() do
    Supermarket.cart_cached()
    |> LineFromSupermarket.convert
  end

  # List all supermarket products
  # List all planned recipes
  # - get their ingredients

  # ingredients
  # - filter deleted
  # - filter
  # Recipe.list_essentials()

end
