defmodule PicapeWeb.Graphql.Resolver.Order do

  alias Picape.Order

  def current(_parent, _args, _info) do
    {:ok, Order.current() }
  end

  def plan_recipe(_parent, attributes, _info) do
#    IO.inspect attributes
#    Order.plan_recipe(attributes[:recipeId])
    {:ok, Order.current()}
  end
end
