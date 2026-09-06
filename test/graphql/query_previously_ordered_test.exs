defmodule Picape.Graphql.QueryPreviouslyOrderedTest do
  use Picape.AbsintheCase

  @query "{ previouslyOrderedIngredients { name } }"

  defp bought(ingredient, line_id, inserted_at) do
    insert!(:manual_ingredient,
      ingredient: ingredient,
      line_id: line_id,
      inserted_at: ~N[2026-01-01 00:00:00] |> NaiveDateTime.add(inserted_at, :day)
    )
  end

  test "returns nothing when nothing has been bought yet" do
    insert!(:ingredient, name: "Butter")

    assert run(@query) === {:ok, %{data: %{"previouslyOrderedIngredients" => []}}}
  end

  test "returns ingredients of finished orders, most recently bought first" do
    bought(insert!(:ingredient, name: "Butter"), "1700000000000000", 1)
    bought(insert!(:ingredient, name: "Mince"), "1800000000000000", 3)

    assert run(@query) ===
             {:ok,
              %{
                data: %{
                  "previouslyOrderedIngredients" => [%{"name" => "Mince"}, %{"name" => "Butter"}]
                }
              }}
  end

  test "leaves out what is only on the live cart" do
    bought(insert!(:ingredient, name: "Butter"), "1", 1)

    assert run(@query) === {:ok, %{data: %{"previouslyOrderedIngredients" => []}}}
  end

  test "lists an ingredient once, however many orders carried it" do
    butter = insert!(:ingredient, name: "Butter")
    bought(butter, "1700000000000000", 1)
    bought(butter, "1800000000000000", 3)

    assert run(@query) ===
             {:ok, %{data: %{"previouslyOrderedIngredients" => [%{"name" => "Butter"}]}}}
  end

  test "counts an order the supermarket numbered before Picape did" do
    bought(insert!(:ingredient, name: "Butter"), "909-630-0528", 1)

    assert run(@query) ===
             {:ok, %{data: %{"previouslyOrderedIngredients" => [%{"name" => "Butter"}]}}}
  end
end
