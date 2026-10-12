defmodule Picape.Checklist.Item do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Checklist.Item

  schema "checklist_item" do
    field(:checked, :boolean, default: false)

    belongs_to(
      :ingredient,
      Picape.Recipe.Ingredient,
      foreign_key: :ingredient_id
    )

    timestamps()
  end

  @doc false
  def changeset(%Item{} = item, attrs) do
    item
    |> cast(attrs, [:ingredient_id, :checked])
    |> validate_required([:ingredient_id, :checked])
  end
end
