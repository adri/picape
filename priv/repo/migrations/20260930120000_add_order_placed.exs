defmodule Picape.Repo.Migrations.AddOrderPlaced do
  use Ecto.Migration

  def change do
    create table(:order_placed) do
      add :order_id, :string, null: false

      timestamps()
    end

    create unique_index(:order_placed, [:order_id])
  end
end
