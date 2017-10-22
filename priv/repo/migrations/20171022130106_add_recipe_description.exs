defmodule Picape.Repo.Migrations.AddRecipeDescription do
  use Ecto.Migration

  def change do
    alter table(:recipe) do
      add :description, :text
    end
  end
end
