defmodule PicapeWeb.Graphql.Resolver.Order do

  alias Picape.Order

  def current(_parent, _args, _info) do
    {:ok, Order.current() }
  end

  def plan_recipe(_parent, attributes, _info) do
    Order.plan_recipe(attributes[:recipeId])
  end
end
