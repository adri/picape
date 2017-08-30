defmodule QueryRecipeTest do
  use Picape.AbsintheCase

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
end
