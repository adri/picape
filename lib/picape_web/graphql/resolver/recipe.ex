defmodule PicapeWeb.Graphql.Resolver.Recipe do

  alias Picape.{Recipe, Repo}
  alias Picape.Recipe.Ingredient
  alias Absinthe.Relay

# Queries

  def all(_parent, _args, _info) do
    {:ok, Recipe.list_recipes()}
  end

  def essentials(_parent, _args, _info) do
    {:ok, Recipe.list_essentials()}
  end

  def list_ingredients(_parent, args, _info) do
    Ingredient
    |> Relay.Connection.from_query(&Repo.all/1, args)
  end

  def search_ingredient(_parent, attributes, _info) do
    {:ok, Recipe.search_ingredient(attributes[:query], attributes[:excluded] || [])}
  end

  def recipe_by_id(id) do
    case Recipe.recipes_by_ids([id]) do
      {:ok, %{^id => result}} -> {:ok, result}
      _ -> {:error, :not_found}
    end
  end

  def ingredient_by_id(id) do
    case Recipe.ingredients_by_ids([id]) do
      {:ok, %{^id => result}} -> {:ok, result}
      _ -> {:error, :not_found}
    end
  end

  def recipes_by_ids(ids) do
    Recipe.recipes_by_ids(ids)
  end

  def ingredients_by_ids(ids) do
    Recipe.recipes_by_ids(ids)
  end

  def ingredients_by_item_ids(_, item_ids) do
    Recipe.ingredients_by_item_ids(item_ids)
  end

  def ingredients_by_recipe_ids(_, recipe_ids) do
    Recipe.ingredients_by_recipe_ids(recipe_ids)
  end

# Mutations

  def add_ingredient(_parent, attributes, _info) do
    Recipe.add_ingredient(attributes)
  end

  def edit_ingredient(_parent, attributes, _info) do
    Recipe.edit_ingredient(attributes)
  end

  def delete_ingredient(_parent, attributes, _info) do
    Recipe.delete_ingredient(attributes)
  end

  def add_recipe(_parent, attributes, _info) do
    Recipe.add_recipe(attributes)
  end

  def edit_recipe(_parent, attributes, _info) do
    attributes
    |> Map.put(:id, attributes[:recipe_id])
    |> Recipe.edit_recipe
  end

  # def find(_parent, %{id: id}, _info) do
  #   case Repo.get(Customer, id) do
  #     nil  -> {:error, "Customer id #{id} not found"}
  #     user -> {:ok, user}
  #   end
  # end
end
