defmodule Picape.Order.Item do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Order.Item

  schema "order_item" do
    field(:product_id, :integer)
    field(:name, :string)
    field(:image_url, :string)
    field(:quantity, :integer)
    field(:is_orderable, :boolean, default: true, virtual: true)
    field(:availability_label, :string, virtual: true)
    field(:checked, :boolean, virtual: true, default: false)
    field(:recipe_ids, {:array, :integer})
    field(:line_id, :string)
    field(:ingredient_id, :id)

    timestamps()
  end

  @doc false
  def changeset(%Item{} = item, attrs) do
    item
    |> cast(attrs, [:quantity, :recipe_ids, :line_id, :product_id, :name, :image_url, :ingredient_id])
    |> validate_required([:quantity, :recipe_ids])
  end
end
