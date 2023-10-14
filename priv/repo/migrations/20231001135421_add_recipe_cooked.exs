defmodule Picape.Repo.Migrations.AddSupermarketLogin do
  use Ecto.Migration

  def change do
    alter table(:order_planned_recipe) do
      add :cooked, :boolean, default: false
    end
  end
end
