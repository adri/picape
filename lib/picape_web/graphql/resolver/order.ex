defmodule PicapeWeb.Graphql.Resolver.Order do

  alias Picape.{Supermarket, Order}
  alias PicapeWeb.Graphql.Resolver

  defp order_id() do
    "1"
  end

# Queries

  def current(_parent, _args, _info) do
    Order.current()
  end

  def recipies_planned?(_, recipe_ids) do
    {:ok, planned_ids} = Order.planned_recipes(order_id())

    {:ok, Map.new(recipe_ids, fn id -> {id, Enum.member?(planned_ids, id)} end)}
  end

  def ingredients_planned?(_, ingredient_ids) do
     Order.ingredients_planned?(order_id(), ingredient_ids)
  end

  def ingredients_ordered_quantity(_, ingredient_ids) do
    Order.ingredients_ordered_quantity(order_id(), ingredient_ids)
  end

  def recipes_planned_for_ingredient_ids(_, ingredient_ids) do
    Order.recipes_planned_for_ingredient_ids(order_id(), ingredient_ids)
  end

# Mutations

  def plan_recipe(attributes, _info) do
    Order.plan_recipe(order_id(), attributes[:recipe_id], false)

    Resolver.Recipe.recipe_by_id(String.to_integer(attributes[:recipe_id]))
  end

  def unplan_recipe(attributes, _info) do
    Order.plan_recipe(order_id(), attributes[:recipe_id], true)

    Resolver.Recipe.recipe_by_id(String.to_integer(attributes[:recipe_id]))
  end

  def sync_supermarket(_attributes, _info) do
    Supermarket.invalidate_cart()
    Supermarket.invalidate_order()
    Order.sync_supermarket(order_id())
  end

  def order_ingredient(attributes, _info) do
    Order.order_ingredient(order_id(), attributes[:ingredient_id], attributes[:quantity])
  end
end
