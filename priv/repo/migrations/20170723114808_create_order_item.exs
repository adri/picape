defmodule Picape.Repo.Migrations.CreatePicape.Order.Item do
  use Ecto.Migration

  def change do
    create table(:order_item) do
      add :quantity, :integer
      add :recipe_ids, {:array, :integer}
      add :line_id, references(:order_line, on_delete: :nothing)
      add :ingredient_id, references(:recipe_ingredient, on_delete: :nothing)

      timestamps()
    end

    create index(:order_item, [:line_id, :ingredient_id])
  end
end
