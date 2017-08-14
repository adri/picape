defmodule Picape.Repo.Migrations.OrderLineItemString do
  use Ecto.Migration

  def change do
    alter table(:order_planned_recipe) do
      modify :line_id, :string
    end

    alter table(:order_manual_ingredient) do
      modify :line_id, :string
    end
  end
end
