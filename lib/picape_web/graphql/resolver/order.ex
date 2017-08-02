defmodule PicapeWeb.Graphql.Resolver.Order do

  alias Picape.Order

  def current(_parent, _args, _info) do
    Order.current()
  end

  def plan_recipe(attributes, _info) do
    Order.plan_recipe(1, attributes[:recipe_id])
  end

  def unplan_recipe(attributes, _info) do
    Order.unplan_recipe(1, attributes[:recipe_id])
  end

  def sync_supermarket(_attributes, _info) do
    Order.sync_supermarket(1)
  end
end
