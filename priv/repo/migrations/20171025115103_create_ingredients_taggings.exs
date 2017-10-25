defmodule Picape.Repo.Migrations.CreateIngredientsTaggings do
  use Ecto.Migration

  def change do
    create table(:recipe_ingredient_tagging, primary_key: false) do
      add :ingredient_id, references(:recipe_ingredient), null: false
      add :ingredient_tag_id, references(:recipe_ingredient_tag), null: false
    end
  end
end
