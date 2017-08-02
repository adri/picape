defmodule Picape.Order.Item do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Order.Item


  schema "order_item" do
    field :name, :string
    field :image_url, :string
    field :quantity, :integer
    field :recipe_ids, {:array, :integer}
    field :line_id, :id
    field :ingredient_id, :id

    timestamps()
  end

  @doc false
  def changeset(%Item{} = item, attrs) do
    item
    |> cast(attrs, [:quantity, :recipe_ids])
    |> validate_required([:quantity, :recipe_ids])
  end
end
