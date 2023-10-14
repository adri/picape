defmodule Picape.Order.PlannedRecipe do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Order.PlannedRecipe

  schema "order_planned_recipe" do
    field(:line_id, :string)
    field(:recipe_id, :id)
    field(:unplanned, :boolean, default: false)
    field(:cooked, :boolean, default: false)
    field(:quantity, :integer, default: 1)

    timestamps()
  end

  @doc false
  def changeset(%PlannedRecipe{} = planned_recipe, attrs) do
    planned_recipe
    |> cast(attrs, [:line_id, :recipe_id, :unplanned])
    |> validate_required([:line_id, :recipe_id])
  end
end
