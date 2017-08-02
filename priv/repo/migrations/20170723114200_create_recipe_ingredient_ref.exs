defmodule Picape.Repo.Migrations.CreatePicape.Recipe.IngredientRef do
  use Ecto.Migration

  def change do
    create table(:recipe_ingredient_ref) do
      add :quantity, :integer
      add :recipe_id, references(:recipe, on_delete: :nothing)
      add :ingredient_id, references(:recipe_ingredient, on_delete: :nothing)

      timestamps()
    end

    create index(:recipe_ingredient_ref, [:recipe_id, :ingredient_id])
  end
end
