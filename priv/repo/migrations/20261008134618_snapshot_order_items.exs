defmodule Picape.Repo.Migrations.SnapshotOrderItems do
  use Ecto.Migration

  def change do
    drop(index(:order_item, [:line_id, :ingredient_id]))

    alter table(:order_item) do
      remove(:line_id)
      add(:line_id, :string)
      add(:product_id, :integer)
      add(:name, :string)
      add(:image_url, :string)
    end

    create(index(:order_item, [:line_id]))
  end
end
