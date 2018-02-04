defmodule Picape.Graphql.QueryIngredientTest do
  use Picape.AbsintheCase
  alias Absinthe.Relay.Node

  test "searches by ingredient name" do
    insert!(:ingredient, name: "Flour")
    insert!(:ingredient, name: "Milk")

    actual = run("
      query search($query: String!) {
       searchIngredient(query: $query) {
          name
        }
      }", variables: %{"query" => "Mil"})

    assert actual ===
             {:ok,
              %{
                data: %{
                  "searchIngredient" => [
                    %{"name" => "Milk"}
                  ]
                }
              }}
  end

  test "search excludes ids" do
    insert!(:ingredient, name: "Flour")
    milk = insert!(:ingredient, name: "Milk")

    actual =
      run(
        "
      query search($query: String!, $excluded: [ID]) {
       searchIngredient(query: $query, excluded: $excluded) {
          name
        }
      }",
        variables: %{"query" => "Mil", "excluded" => [Node.to_global_id("Ingredient", milk.id)]}
      )

    assert actual === {:ok, %{data: %{"searchIngredient" => []}}}
  end
end
