defmodule Picape.Recipe.IngredientTag do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Recipe.IngredientTag

  schema "recipe_ingredient_tag" do
    field :description
    field :name, :string, null: false

    many_to_many :ingredients, Picape.Recipe.Ingredient,
      join_through: "recipe_ingredient_tagging"

    timestamps()
  end

  @doc false
  def changeset(%IngredientTag{} = ingredient_tag, attrs) do
    ingredient_tag
    |> cast(attrs, [:name, :description])
    |> validate_required([:name])
  end
end
