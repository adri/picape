defmodule Picape.Recipe.Ingredient do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Recipe.Ingredient
  alias Picape.Supermarket

  schema "recipe_ingredient" do
    field(:is_essential, :boolean, default: false)
    field(:name, :string)
    field(:seasonal_name, :string)
    field(:supermarket_product_id, :integer)
    field(:supermarket_product_raw, :map)

    many_to_many(
      :tags,
      Picape.Recipe.IngredientTag,
      join_through: "recipe_ingredient_tagging",
      on_replace: :delete
    )

    timestamps()
  end

  def fetch(ingredient, :image_url) do
    {:ok, Supermarket.image_url(ingredient.supermarket_product_raw["productCard"])}
  end

  def fetch(ingredient, :unit_quantity) do
    {:ok, get_in(ingredient.supermarket_product_raw, ["productCard", "salesUnitSize"]) || ""}
  end

  def fetch(ingredient, :additional_info) do
    {:ok, get_in(ingredient.supermarket_product_raw, ["productCard", "additional_info"]) || ""}
  end

  def fetch(ingredient, :original_title) do
    {:ok, get_in(ingredient.supermarket_product_raw, ["productCard", "title"]) || ""}
  end

  def fetch(ingredient, :warning) do
    status = get_in(ingredient.supermarket_product_raw, ["productCard", "orderAvailabilityStatus"]) || ""
    out_of_stock = status == "OUT_OF_STOCK"
    out_of_assortment = Enum.member?(["NOT_IN_ASSORTMENT", "NO_LONGER_IN_ASSORTMENT"], status)

    case {out_of_stock, out_of_assortment} do
      {true, _} ->
        {:ok,
         %{
           description: "Ingredient is out of stock",
           out_of_stock: true,
           out_of_assortment: false
         }}

      {_, true} ->
        {:ok,
         %{
           description: "Ingredient is out of assortment",
           out_of_stock: false,
           out_of_assortment: true
         }}

      _ ->
        :error
    end
  end

  def fetch(ingredient, :nutriscore) do
    {:ok, get_in(ingredient.supermarket_product_raw, ["productCard", "properties", "nutriscore", Access.at(0)]) || ""}
  end

  @doc false
  def edit_changeset(%Ingredient{} = ingredient, attrs) do
    ingredient
    |> cast(attrs, [
      :name,
      :seasonal_name,
      :is_essential,
      :supermarket_product_id,
      :supermarket_product_raw
    ])
    |> validate_required([:name, :is_essential])
  end

  @doc false
  def add_changeset(%Ingredient{} = ingredient, attrs) do
    ingredient
    |> cast(attrs, [
      :name,
      :is_essential,
      :supermarket_product_id,
      :supermarket_product_raw
    ])
    |> validate_required([:name, :is_essential, :supermarket_product_id])
    |> unique_constraint(:supermarket_product_id)
  end

  def raw_changeset(%Ingredient{} = ingredient, attrs) do
    ingredient
    |> cast(attrs, [:supermarket_product_raw, :supermarket_product_id])
    |> validate_required([:supermarket_product_raw, :supermarket_product_id])
  end
end
