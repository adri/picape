defmodule Picape.Order.PlacedOrder do
  use Ecto.Schema

  @moduledoc """
  One row per order number the supermarket reported as paid. The row existing
  is the marker that the freeze already archived the plan that produced that
  order, so it records even an empty plan.
  """

  schema "order_placed" do
    field(:order_id, :string)

    timestamps()
  end
end
