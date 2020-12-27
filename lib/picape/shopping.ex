defmodule Picape.Shopping do
  import Ecto.Query

  alias Picape.Repo
  alias Picape.Shopping.{BoughtIngredient}

  def ingredients_bought?(order_id, ingredient_ids) do
    bought_ids =
      Repo.all(
        from(
          b in BoughtIngredient,
          where: b.line_id == ^order_id and b.ingredient_id in ^ingredient_ids and b.undone == false,
          select: b.ingredient_id
        )
      )

    {:ok, Map.new(ingredient_ids, fn id -> {id, Enum.member?(bought_ids, id)} end)}
  end

  def buy_ingredient(order_id, ingredient_id, undone \\ false) do
    %BoughtIngredient{}
    |> BoughtIngredient.changeset(%{
      line_id: order_id,
      ingredient_id: ingredient_id,
      undone: undone
    })
    |> Repo.insert(
      on_conflict: [set: [undone: undone]],
      conflict_target: [:line_id, :ingredient_id]
    )
  end
end
