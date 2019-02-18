defmodule PicapeWeb.Graphql.Resolver.Shopping do
  alias Picape.{Shopping, Order}
  alias PicapeWeb.Graphql.Resolver

  # Queries

  def ingredients_bought?(_, ingredient_ids) do
    Shopping.ingredients_bought?(Order.last_order_id(), ingredient_ids)
  end

  def buy_ingredient(attributes, _info) do
    bought_ingredient = Shopping.buy_ingredient(Order.last_order_id(), attributes[:ingredient_id], attributes[:undo])

    Resolver.Recipe.ingredient_by_id(String.to_integer(attributes[:ingredient_id]))
  end

  def undo_buy_ingredient(attributes, _info) do
    Shopping.buy_ingredient(Order.last_order_id(), attributes[:ingredient_id], true)
  end
end
