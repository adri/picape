defmodule PicapeWeb.ShortcutController do
  use PicapeWeb, :controller

  alias Picape.{Ingredients, Order}

  def add_ingredient(conn, %{"query" => query} = _params) do
    case Ingredients.list(filter: [name: query]) do
      [ingredient|_tail] ->
        Order.order_ingredient("1", ingredient.id, 1)

        render(conn, "add_ingredient.json", %{ingredient: ingredient})
      [] -> conn
            |> put_status(404)
            |> json(%{id: 123})
    end
  end

  def remove_ingredient(conn, %{"id" => id} = _params) do
    Order.order_ingredient("1", id, 0)
  end
end
