defmodule Picape.Repo.Migrations.AddSupermarketLogin do
  use Ecto.Migration

  def change do
    create table(:supermarket_login) do
      add :access_token, :string
      add :refresh_token, :string

      timestamps()
    end
  end
end
