defmodule Picape.Repo.Migrations.AddSupermarketLoginExpiresIn do
  use Ecto.Migration

  def change do
    alter table(:supermarket_login) do
      add :expires_in, :integer, default: 0, null: false
    end
  end
end
