defmodule Picape.Recipe.Ingredient do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Recipe.Ingredient
  alias Picape.Supermarket

  schema "recipe_ingredient" do
    field :is_essential, :boolean, default: false
    field :name, :string
    field :supermarket_product_id, :integer
    field :supermarket_product_raw, :map

    timestamps()
  end

  def fetch(ingredient, :image_url) do
    {:ok, Supermarket.image_url(ingredient.supermarket_product_raw["product_details"]["image_id"])}
  end

  def fetch(ingredient, :unit_quantity) do
    {:ok, ingredient.supermarket_product_raw["product_details"]["unit_quantity"]}
  end

  @doc false
  def edit_changeset(%Ingredient{} = ingredient, attrs) do
    ingredient
    |> cast(attrs, [:name, :is_essential])
    |> validate_required([:name, :is_essential])
  end

  @doc false
  def add_changeset(%Ingredient{} = ingredient, attrs) do
    ingredient
    |> cast(attrs, [:name, :is_essential, :supermarket_product_id, :supermarket_product_raw])
    |> validate_required([:name, :is_essential, :supermarket_product_id])
    |> unique_constraint(:supermarket_product_id)
  end

  def raw_changeset(%Ingredient{} = ingredient, attrs) do
    ingredient
    |> cast(attrs, [:supermarket_product_raw])
    |> validate_required([:supermarket_product_raw])
  end
end
