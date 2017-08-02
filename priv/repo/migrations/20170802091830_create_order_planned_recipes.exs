defmodule Picape.Repo.Migrations.CreateOrderPlannedRecipes do
  use Ecto.Migration

  def change do
    create table(:order_planned_recipe) do
      add :quantity, :integer, default: 1, null: false
      add :unplanned, :boolean, default: false, null: false
#      add :line_id, references(:order_line, on_delete: :nothing)
      add :line_id, :integer
      add :recipe_id, references(:recipe, on_delete: :nothing)

      timestamps()
    end

    create unique_index(:order_planned_recipe, [:line_id, :recipe_id], name: :order_recipe_unique)
  end
end
