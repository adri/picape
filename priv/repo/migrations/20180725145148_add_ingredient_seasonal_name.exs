defmodule Picape.Repo.Migrations.AddIngredientSeasonalName do
  use Ecto.Migration

  def change do
    alter table(:recipe_ingredient) do
      add :seasonal_name, :string, null: true, default: nil
    end
  end
end
