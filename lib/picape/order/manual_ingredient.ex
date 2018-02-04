defmodule Picape.Order.ManualIngredient do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Order.ManualIngredient

  schema "order_manual_ingredient" do
    field(:quantity, :integer)
    field(:line_id, :string)
    belongs_to(:ingredient, Picape.Recipe.Ingredient, foreign_key: :ingredient_id)

    timestamps()
  end

  @doc false
  def changeset(%ManualIngredient{} = manual_ingredient, attrs) do
    manual_ingredient
    |> cast(attrs, [:line_id, :ingredient_id, :quantity])
    |> validate_required([:line_id, :ingredient_id, :quantity])
  end
end
