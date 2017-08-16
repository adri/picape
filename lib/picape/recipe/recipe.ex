defmodule Picape.Recipe.Recipe do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Recipe.Recipe


  schema "recipe" do
    field :image_url, :string
    field :title, :string
    has_many :ingredients, Picape.Recipe.IngredientRef, on_replace: :delete
    has_many :ingredients_ref, through: [:ingredients, :ingredient]

    timestamps()
  end

  def add_changeset(%Recipe{} = recipe, attrs) do
    recipe
    |> cast(attrs, [:title])
    |> validate_required([:title])
  end

  @doc false
  def edit_changeset(%Recipe{} = recipe, attrs) do
    recipe
    |> cast(attrs, [:id, :title])
    |> cast_assoc(:ingredients, required: true)
    |> validate_required([:title, :ingredients])
  end
end
