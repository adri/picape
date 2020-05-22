defmodule PicapeWeb.ShortcutController do
  use PicapeWeb, :controller

  alias Picape.{Ingredients, Order}

  def add_ingredient(conn, %{"query" => query} = _params) do
    case Ingredients.list(filter: [name: query]) do
      [ingredient] ->
        Order.order_ingredient("1", ingredient.id, 1)

        Absinthe.Subscription.publish(PicapeWeb.Endpoint, ingredient, ingredient_ordered: ingredient.id)

        render(conn, "add_ingredient.json", %{ingredient: ingredient})

      ingredients when is_list(ingredients) and length(ingredients) > 0 ->
        render(conn, "choose_ingredient.json", %{ingredients: ingredients})

      [] ->
        conn
        |> put_status(404)
        |> json(%{})
    end
  end

  def add_ingredient_by_id(conn, %{"id" => id} = _params) do
    Order.order_ingredient("1", id, 1)

    json(conn, %{})
  end

  def remove_ingredient(conn, %{"id" => id} = _params) do
    Order.order_ingredient("1", id, 0)

    json(conn, %{})
  end
end
