defmodule Picape.Repo.Migrations.CreatePicape.Order.Line do
  use Ecto.Migration

  def change do
    create table(:order_line) do

      timestamps()
    end

  end
end
