defmodule Picape.Recipe.Recipe do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Recipe.Recipe


  schema "recipe" do
    field :image_url, :string
    field :title, :string
    has_many :ingredients, Picape.Recipe.IngredientRef
    has_many :ingredients_ref, through: [:ingredients, :ingredient]

    timestamps()
  end

  @doc false
  def changeset(%Recipe{} = recipe, attrs) do
    recipe
    |> cast(attrs, [:title, :ingredients])
    |> validate_required([:title, :ingredients])
    |> cast_assoc(:ingredients_ref, required: true)
  end
end
