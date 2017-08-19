defmodule Picape.Recipe.Recipe do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Recipe.Recipe


  schema "recipe" do
    field :title, :string
    field :image_url, :string
    has_many :ingredients, Picape.Recipe.IngredientRef, on_replace: :delete
    has_many :ingredients_ref, through: [:ingredients, :ingredient]

    timestamps()
  end

  def add_changeset(%Recipe{} = recipe, attrs) do
    recipe
    |> cast(attrs, [:title, :image_url])
    |> validate_required([:title])
  end

  @doc false
  def edit_changeset(%Recipe{} = recipe, attrs) do
    recipe
    |> cast(attrs, [:id, :title, :image_url])
    |> cast_assoc(:ingredients, required: true)
    |> validate_required([:title, :ingredients])
  end
end
