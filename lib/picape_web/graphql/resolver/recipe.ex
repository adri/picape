defmodule PicapeWeb.Graphql.Resolver.Recipe do

  alias Picape.{Recipe, Repo}
  alias Picape.Recipe.Ingredient
  alias Absinthe.Relay

  def all(_parent, _args, _info) do
    {:ok, Recipe.list_recipes() }
  end

  def essentials(_parent, _args, _info) do
    {:ok, Recipe.list_essentials() }
  end

  def list_ingredients(_parent, args, _info) do
    Ingredient
    |> Relay.Connection.from_query(&Repo.all/1, args)
  end

   def add_ingredient(_parent, attributes, _info) do
     Recipe.add_ingredient(attributes)
   end

   # def find(_parent, %{id: id}, _info) do
   #   case Repo.get(Customer, id) do
   #     nil  -> {:error, "Customer id #{id} not found"}
   #     user -> {:ok, user}
   #   end
   # end
end
