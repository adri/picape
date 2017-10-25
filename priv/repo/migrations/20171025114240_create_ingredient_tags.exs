defmodule Picape.Repo.Migrations.CreateIngredientTags do
  use Ecto.Migration

  def change do
    create table(:recipe_ingredient_tag) do
      add :name, :string, null: false
      add :description, :string

      timestamps()
    end
  end
end
