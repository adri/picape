defmodule Picape.Repo.Migrations.AddIngredientPicnicProduct do
  use Ecto.Migration

  def change do
    alter table(:recipe_ingredient) do
      add :picnic_product_id, :string
      add :picnic_product_raw, :map
    end

    create unique_index(:recipe_ingredient, [:picnic_product_id],
             name: :recipe_ingredient_picnic_selling_unit_index
           )
  end
end
