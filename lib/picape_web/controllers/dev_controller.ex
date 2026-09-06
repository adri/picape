defmodule PicapeWeb.DevController do
  use PicapeWeb, :controller

  alias Picape.{Bonus, Order, Supermarket}

  def invalidate_cart(conn, _params) do
    Supermarket.invalidate_cart()
    send_resp(conn, 204, "")
  end

  @doc """
  Drops the cached bonus offers.

  Activating one is a write the fake remembers, and Picape caches the offers for
  five hours, so a test that activates leaves both sides out of step with the
  fixture the next test expects.
  """
  def invalidate_bonus(conn, _params) do
    Bonus.invalidate()
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
