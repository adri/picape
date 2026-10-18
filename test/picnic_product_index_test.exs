defmodule Picape.PicnicProductIndexTest do
  use Picape.DataCase, async: false

  alias Picape.Recipe.Ingredient
  alias Picape.Repo

  # Prod carries an index named recipe_ingredient_picnic_product_id_index on
  # supermarket_product_id, left over from a column rename — the same name
  # Ecto picks by default for a unique index on picnic_product_id, so the
  # migration must name its index explicitly or release fails on the
  # collision. Recreate that prod state and run the real migration over it.
  # The sandbox holds only one connection and Ecto.Migrator needs two, so the
  # migration runs in a subprocess against the test database: down commits,
  # the leftover index is created, up commits, then the leftover is dropped.
  test "migration runs with prod's leftover index and duplicate picnic ids stay changeset errors" do
    script = """
    Code.require_file("priv/repo/migrations/20261018120000_add_ingredient_picnic_product.exs")
    mod = Picape.Repo.Migrations.AddIngredientPicnicProduct
    Picape.Repo.query!("ALTER INDEX IF EXISTS recipe_ingredient_picnic_product_id_index RENAME TO recipe_ingredient_picnic_selling_unit_index")
    Ecto.Migrator.down(Picape.Repo, 20261018120000, mod)
    Picape.Repo.query!("CREATE UNIQUE INDEX recipe_ingredient_picnic_product_id_index ON recipe_ingredient (supermarket_product_id)")
    Ecto.Migrator.up(Picape.Repo, 20261018120000, mod)
    Picape.Repo.query!("DROP INDEX recipe_ingredient_picnic_product_id_index")
    IO.puts("migration_ok")
    """

    {out, status} =
      System.cmd("mix", ["run", "-e", script], env: [{"MIX_ENV", "test"}], cd: File.cwd!())

    assert status == 0, out
    assert out =~ "migration_ok"

    attrs = %{name: "Sugar", picnic_product_id: "s1"}
    assert {:ok, _} = %Ingredient{} |> Ingredient.add_changeset(attrs) |> Repo.insert()
    assert {:error, changeset} = %Ingredient{} |> Ingredient.add_changeset(attrs) |> Repo.insert()
    assert %{picnic_product_id: ["has already been taken"]} = errors_on(changeset)
  end
end
