defmodule PicapeWeb.Graphql.Resolver.Recipe do
  alias Picape.{Recipe, Ingredients, Repo}
  alias Absinthe.Relay

  # Queries

  def all(_parent, _args, _info) do
    {:ok, Recipe.list_recipes()}
  end

  def essentials(_parent, _args, _info) do
    {:ok, Recipe.list_essentials()}
  end

  def list_ingredients(_parent, args, _info) do
    Relay.Connection.from_query(Ingredients.list_query(args), &Repo.all/1, args)
  end

  def list_ingredient_tags(_parent, _args, _info) do
    Ingredients.list_tags()
  end

  def count_ingredients(_parent, _args, _info) do
    Ingredients.count_all()
  end

  def search_ingredient(_parent, attributes, _info) do
    args = [
      {:filter,
       [
         {:name, attributes[:query]},
         {:excluded, attributes[:excluded] || []}
       ]}
    ]

    {:ok, Ingredients.list(args)}
  end

  def recipe_by_id(id) do
    case Recipe.recipes_by_ids([id]) do
      {:ok, %{^id => result}} -> {:ok, result}
      _ -> {:error, :not_found}
    end
  end

  def ingredient_by_id(id) do
    case Ingredients.ingredients_by_ids([id]) do
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
    Ingredients.add_ingredient(attributes)
  end

  def edit_ingredient(_parent, attributes, _info) do
    Ingredients.edit_ingredient(attributes[:input])
  end

  def delete_ingredient(_parent, attributes, _info) do
    Ingredients.delete_ingredient(attributes)
  end

  def add_recipe(_parent, attributes, _info) do
    Recipe.add_recipe(attributes)
  end

  def edit_recipe(_parent, attributes, _info) do
    attributes
    |> Map.put(:id, attributes[:recipe_id])
    |> Recipe.edit_recipe()
  end
end
