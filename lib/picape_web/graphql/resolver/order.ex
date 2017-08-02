defmodule PicapeWeb.Graphql.Resolver.Order do

  alias Picape.Order

  def current(_parent, _args, _info) do
    Order.current()
  end

  def plan_recipe(attributes, _info) do
    Order.plan_recipe(attributes[:recipe_id])
  end
end
