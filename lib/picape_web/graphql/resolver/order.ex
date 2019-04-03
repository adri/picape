defmodule PicapeWeb.Graphql.Resolver.Order do
  alias Picape.{Supermarket, Order, Recipe}
  alias PicapeWeb.Graphql.Resolver

  defp order_id() do
    "1"
  end

  # Queries

  def current(_parent, _args, _info) do
    Order.current()
  end

  def last(_parent, _args, _info) do
    Order.last()
  end

  def last_ordered(_parent, _args, _info) do
    with {:ok, recipe_ids} <- Order.planned_recipes(Order.last_order_id()),
         {:ok, recipe_map} <- Recipe.recipes_by_ids(recipe_ids) do
      {:ok, Map.values(recipe_map)}
    else
      _ -> {:error, []}
    end
  end

  def recipes_planned?(_, recipe_ids) do
    {:ok, planned_ids} = Order.planned_recipes(order_id())

    {:ok, Map.new(recipe_ids, fn id -> {id, Enum.member?(planned_ids, id)} end)}
  end

  def ingredients_planned?(_, ingredient_ids) do
    Order.ingredients_planned?(order_id(), ingredient_ids)
  end

  def ingredients_in_shopping?(_, ingredient_ids) do
    Order.ingredients_planned?(Order.last_order_id(), ingredient_ids)
  end

  def ingredients_ordered_quantity(_, ingredient_ids) do
    Order.ingredients_ordered_quantity(order_id(), ingredient_ids)
  end

  def ingredients_shopping_quantity(_, ingredient_ids) do
    Order.ingredients_ordered_quantity(Order.last_order_id(), ingredient_ids)
  end

  def recipes_planned_for_ingredient_ids(_, ingredient_ids) do
    Order.recipes_planned_for_ingredient_ids(order_id(), ingredient_ids)
  end

  def recipes_shopping_for_ingredient_ids(_, ingredient_ids) do
    Order.recipes_planned_for_ingredient_ids(Order.last_order_id(), ingredient_ids)
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

  def sync_supermarket(attributes, _info) do
    if attributes[:refresh] do
      Supermarket.invalidate_cart()
      Supermarket.invalidate_orders()
    end

    Order.sync_supermarket(order_id())
  end

  def start_shopping(attributes, _info) do
    Order.start_shopping(order_id())
  end

  def stop_shopping(attributes, _info) do
    Order.stop_shopping(order_id())
  end

  def order_ingredient(attributes, _info) do
    {:ok, _} =
      Order.order_ingredient(
        order_id(),
        attributes[:ingredient_id],
        attributes[:quantity]
      )

    Resolver.Recipe.ingredient_by_id(String.to_integer(attributes[:ingredient_id]))
  end
end
