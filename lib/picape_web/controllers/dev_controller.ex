defmodule PicapeWeb.DevController do
  use PicapeWeb, :controller

  alias Picape.{Order, Supermarket}

  def invalidate_cart(conn, _params) do
    Supermarket.invalidate_cart()
    send_resp(conn, 204, "")
  end

  @doc """
  Unplans everything in the current order.

  Planned recipes are rows, not per-request state, so a test that plans one
  leaves it planned for every test after it. The screen tests are taken against
  the seeded state, so without this the suite's result depends on the order its
  files happen to run in.
  """
  def reset_plan(conn, _params) do
    {:ok, recipe_ids} = Order.planned_recipes("1")
    Enum.each(recipe_ids, &Order.plan_recipe("1", &1, true))
    Supermarket.invalidate_cart()
    send_resp(conn, 204, "")
  end
end
