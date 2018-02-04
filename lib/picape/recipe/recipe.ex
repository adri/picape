defmodule Picape.Recipe.Recipe do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Recipe.Recipe

  schema "recipe" do
    field(:title, :string)
    field(:image_url, :string)
    field(:description, :string)
    has_many(:ingredients, Picape.Recipe.IngredientRef, on_replace: :delete)
    has_many(:ingredients_ref, through: [:ingredients, :ingredient])

    timestamps()
  end

  def fetch(recipe, :image_url) do
    cond do
      recipe.image_url == nil ->
        {:ok, nil}

      false === String.contains?(recipe.image_url, "res.cloudinary.com") ->
        {:ok,
         "https://res.cloudinary.com/picape/image/fetch/t_all_images,f_auto/" <> recipe.image_url}

      true ->
        {:ok, recipe.image_url}
    end
  end

  def add_changeset(%Recipe{} = recipe, attrs) do
    recipe
    |> cast(attrs, [:title, :image_url])
    |> validate_required([:title])
  end

  @doc false
  def edit_changeset(%Recipe{} = recipe, attrs) do
    recipe
    |> cast(attrs, [:id, :title, :description, :image_url])
    |> cast_assoc(:ingredients, required: true)
    |> validate_required([:title, :ingredients])
  end
end
