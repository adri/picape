defmodule Picape.Repo.Migrations.CreatePicape.Recipe.Recipe do
  use Ecto.Migration

  def change do
    create table(:recipe) do
      add :title, :string, null: false
      add :image_url, :string

      timestamps()
    end

  end
end
