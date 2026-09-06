defmodule Picape.Order.Line do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Order.Line

  schema "order_line" do
    has_many(:items, Picape.Order.Item)
    field(:total_count, :integer)
    field(:total_price, :integer)
    field(:total_discount, :integer)
    field(:delivery_date, :string)
    field(:delivery_start_time, :string)
    field(:delivery_end_time, :string)

    timestamps()
  end

  @doc false
  def changeset(%Line{} = line, attrs) do
    line
    |> cast(attrs, [])
    |> validate_required([])
  end
end
