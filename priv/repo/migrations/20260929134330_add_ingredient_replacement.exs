defmodule Picape.Repo.Migrations.AddIngredientReplacement do
  use Ecto.Migration

  def change do
    alter table(:recipe_ingredient) do
      add :replacement_ingredient_id, references(:recipe_ingredient, on_delete: :nilify_all)
    end
  end
end
