defmodule Picape.Repo.Migrations.CreateShoppingBoughtIngredient do
  use Ecto.Migration

  def change do
    create table(:shopping_bought_ingredient) do
      add :line_id, :string
      add :undone, :boolean, default: false, null: false
      add :ingredient_id, references(:recipe_ingredient, on_delete: :nothing)

      timestamps()
    end

    create unique_index(:shopping_bought_ingredient, [:line_id, :ingredient_id], name: :order_ingredient_unique)
  end
end
