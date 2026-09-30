defmodule PicapeWeb.DevController do
  use PicapeWeb, :controller

  import Ecto.Query

  alias Picape.{Bonus, Order, Repo, Supermarket}
  alias Picape.Order.{ManualIngredient, PlannedRecipe}

  def invalidate_cart(conn, _params) do
    Supermarket.invalidate_cart()
    send_resp(conn, 204, "")
  end

  @doc """
  Drops the cached order summaries. The supermarket fake can pretend an order
  was paid or delivered, and Picape caches the summaries for five hours, so a
  test that places one leaves both sides out of step without this.
  """
  def invalidate_orders(conn, _params) do
    Supermarket.invalidate_orders()
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

  Planned recipes and manual quantities are rows, not per-request state, so a
  test that plans or buys leaves it set for every test after it. The screen
  tests are taken against the seeded state, so without this the suite's result
  depends on the order its files happen to run in.
  """
  def reset_plan(conn, _params) do
    {:ok, recipe_ids} = Order.planned_recipes("1")
    Enum.each(recipe_ids, &Order.plan_recipe("1", &1, true))
    Repo.delete_all(from(m in ManualIngredient, where: m.line_id == "1"))
    Repo.delete_all(from(p in PlannedRecipe, where: p.line_id == "1"))
    Supermarket.invalidate_cart()
    send_resp(conn, 204, "")
  end
end
