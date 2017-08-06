defmodule Picape.Repo.Migrations.CreateOrderManualIngredient do
  use Ecto.Migration

  def change do
    create table(:order_manual_ingredient) do
      add :quantity, :integer, default: 1, null: false
      add :line_id, :integer
      add :ingredient_id, references(:recipe_ingredient, on_delete: :nothing)

      timestamps()
    end

    create unique_index(:order_manual_ingredient, [:line_id, :ingredient_id], name: :order_manual_ingredient_unique)
  end
end
