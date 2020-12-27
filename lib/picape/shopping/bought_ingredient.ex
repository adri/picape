defmodule Picape.Shopping.BoughtIngredient do
  use Ecto.Schema
  import Ecto.Changeset

  schema "shopping_bought_ingredient" do
    field(:line_id, :string)
    field(:undone, :boolean, default: false)
    field(:ingredient_id, :id)

    timestamps()
  end

  @doc false
  def changeset(bought_ingredient, attrs) do
    bought_ingredient
    |> cast(attrs, [:line_id, :ingredient_id, :undone])
    |> validate_required([:line_id, :ingredient_id, :undone])
  end
end
