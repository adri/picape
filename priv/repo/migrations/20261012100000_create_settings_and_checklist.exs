defmodule Picape.Repo.Migrations.CreateSettingsAndChecklist do
  use Ecto.Migration

  def change do
    create table(:setting) do
      add :key, :string, null: false
      add :value, :string, null: false

      timestamps()
    end

    create unique_index(:setting, [:key])

    create table(:checklist_item) do
      add :checked, :boolean, default: false, null: false
      add :ingredient_id, references(:recipe_ingredient, on_delete: :delete_all), null: false

      timestamps()
    end

    create unique_index(:checklist_item, [:ingredient_id])
  end
end
