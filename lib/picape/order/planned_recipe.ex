defmodule Picape.Order.PlannedRecipe do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Order.PlannedRecipe


  schema "order_planned_recipe" do
    field :line_id, :id
    field :recipe_id, :id
    field :unplanned, :boolean, default: false
    field :quantity, :integer, default: 1

    timestamps()
  end

  @doc false
  def changeset(%PlannedRecipe{} = planned_recipe, attrs) do
    planned_recipe
    |> cast(attrs, [:line_id, :recipe_id])
    |> validate_required([:line_id, :recipe_id])
    |> unique_constraint(:order_recipe_unique, name: :order_recipe_unique)
    |> foreign_key_constraint(:recipe_id)
  end
end
