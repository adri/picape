defmodule Picape.Factory do
  @moduledoc """
  Build and insert test data.

  ## Examples

      Factory.build(:user)
      # => %Picape.User{name: "John Smith"}

      Factory.build(:user, name: "Jane Smith")
      # => %Picape.User{name: "Jane Smith"}

      Factory.insert!(:user, name: "Jane Smith")
      # => %Picape.User{name: "Jane Smith"}
  """

  alias Picape.Repo

  # Define your factories like this:
  #
  # def build(:user) do
  #   %Picape.User{name: "John Smith"}
  # end
  def build(:ingredient) do
    %Picape.Recipe.Ingredient{name: "Butter"}
  end

  def build(:ingredient_tag) do
    %Picape.Recipe.IngredientTag{}
  end

  def build(:essential) do
    build(:ingredient, is_essential: true)
  end

  def build(:product) do
    %Picape.Order.Product{id: 1, quantity: 1}
  end

  def build(:sync_changes) do
    %Picape.Order.Sync.Changes{}
  end

  def build(:recipe) do
    %Picape.Recipe.Recipe{title: "Nasi"}
  end

  def build(:recipe_ingredient) do
    %Picape.Recipe.IngredientRef{quantity: 1}
  end

  def build(:product_map, attributes) do
    Map.merge(%{}, attributes)
  end

  def build(:recipe, attrs) do
    build(:recipe)
    |> struct(attrs)
    |> struct(ingredients: ref_ingredients(attrs[:ingredients] || []))
  end


  @doc """
  Build a schema struct with custom attributes.

  ## Example

  Suppose you had a `build/1` factory for users:

      def build(:user) do
        %Picape.User{name: "John Smith"}
      end

  You could call `build/2` to customize the name:

      Factory.build(:user, name: "Custom Name")
      # => %Picape.User{name: "Custom Name"}
  """
  def build(factory_name, attributes) do
    factory_name
    |> build()
    |> struct(attributes)
  end

  def ref_ingredients(ingredients) do
    ingredients
    |> Enum.map(&build(:recipe_ingredient, ingredient: &1))
  end

  @doc """
  Builds and inserts a factory.

  ## Example

  Suppose you had a `build/1` factory for users:

      def build(:user) do
        %Picape.User{name: "John Smith"}
      end

  You can customize and insert the factory in one call to `insert!/2`:

      Factory.insert!(:user, name: "Custom Name")
      # => Picape.User{name: "Custom Name"}
  """
  def insert!(factory_name, attributes \\ []) do
    factory_name
    |> build(attributes)
    |> Repo.insert!
  end
end

