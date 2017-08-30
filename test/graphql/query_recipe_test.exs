defmodule Picape.Graphql.QueryRecipeTest do
  use Picape.AbsintheCase
  alias Absinthe.Relay.Node

  test "returns an empty list of recipes" do
    assert {:ok, %{data: %{"recipes" => []}}} = run("{ recipes { id } }")
  end

  @query """
  {
    recipes {
      title
      imageUrl
    }
  }
  """
  test "returns a list of two recipes", %{query: query} do
    insert! :recipe, title: "Shoarma", image_url: "https://server/shoarma.jpg"
    insert! :recipe, title: "Pizza", image_url: "https://server/pizza.jpg"

    expected = %{
      "recipes" => [
        %{ "title" => "Shoarma", "imageUrl" => "https://server/shoarma.jpg" },
        %{ "title" => "Pizza", "imageUrl" => "https://server/pizza.jpg" },
      ]
    }
    assert {:ok, %{data: expected}} == run(query)
  end

  @query """
  {
    recipes {
      title
      ingredients {
        name
      }
    }
  }
  """
  test "returns ingredients for a recipe", %{query: query} do
    insert! :recipe, title: "Pizza", ingredients: [
      insert!(:ingredient, name: "Flour")
    ]

    expected = %{
      "recipes" => [
        %{
          "title" => "Pizza",
          "ingredients" => [
            %{ "name" => "Flour" }
          ]
        }
      ]
    }
    assert {:ok, %{data: expected}} == run(query)
  end

  @query """
  query node($id: ID!) {
    node(id: $id) {
      ... on Recipe {
        title
        imageUrl
      }
    }
  }
  """
  test "returns recipe node", %{query: query} do
    recipe = insert! :recipe, title: "Shoarma", image_url: "https://server/shoarma.jpg"

    expected = %{
      "node" => %{
        "title" => "Shoarma",
        "imageUrl" => "https://server/shoarma.jpg"
      },
    }
    assert {:ok, %{data: expected}} == run(query, variables: %{"id" => Node.to_global_id("Recipe", recipe.id)})
  end
end
