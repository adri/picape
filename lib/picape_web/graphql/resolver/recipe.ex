defmodule PicapeWeb.Graphql.Resolver.Recipe do

  alias Picape.{Recipe, Order}

  def all(_parent, _args, _info) do
    {:ok, Recipe.list_recipes() }
  end

  def is_planned(recipe) do
    {:ok, recipe_ids} = Order.planned_recipes(1)
    {:ok, Enum.member?(recipe_ids, recipe.id)}
  end

  def essentials(_parent, _args, _info) do
    {:ok, Recipe.list_essentials() }
  end

  # def find(_parent, %{id: id}, _info) do
  #   case Repo.get(Customer, id) do
  #     nil  -> {:error, "Customer id #{id} not found"}
  #     user -> {:ok, user}
  #   end
  # end

  # def create(_parent, attributes, _info) do
  #   changeset = Customer.changeset(%Customer{}, attributes)
  #   case Repo.insert(changeset) do
  #     {:ok, customer} -> {:ok, customer}
  #     {:error, changeset} -> {:error, changeset.errors}
  #   end
  # end
end
