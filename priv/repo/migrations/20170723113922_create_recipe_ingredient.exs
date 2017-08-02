defmodule Picape.Repo.Migrations.CreatePicape.Recipe.Ingredient do
  use Ecto.Migration

  def change do
    create table(:recipe_ingredient) do
      add :name, :string, null: false
      add :is_essential, :boolean, default: false, null: false
      add :supermarket_product_id, :integer
      add :supermarket_product_raw, :map

      timestamps()
    end

    create unique_index(:recipe_ingredient, [:supermarket_product_id])
  end
end
