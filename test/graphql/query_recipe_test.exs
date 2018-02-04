defmodule Picape.Graphql.QueryRecipeTest do
  use Picape.AbsintheCase
  alias Absinthe.Relay.Node

  test "returns a list of two recipes" do
    insert!(
      :recipe,
      title: "Shoarma",
      image_url:
        "https://res.cloudinary.com/picape/image/fetch/t_all_images,f_auto/https://server/shoarma.jpg"
    )

    insert!(
      :recipe,
      title: "Pizza",
      image_url:
        "https://res.cloudinary.com/picape/image/fetch/t_all_images,f_auto/https://server/pizza.jpg"
    )

    actual = run("{
      recipes {
        title
        imageUrl
      }
    }")

    assert actual ===
             {:ok,
              %{
                data: %{
                  "recipes" => [
                    %{
                      "title" => "Shoarma",
                      "imageUrl" =>
                        "https://res.cloudinary.com/picape/image/fetch/t_all_images,f_auto/https://server/shoarma.jpg"
                    },
                    %{
                      "title" => "Pizza",
                      "imageUrl" =>
                        "https://res.cloudinary.com/picape/image/fetch/t_all_images,f_auto/https://server/pizza.jpg"
                    }
                  ]
                }
              }}
  end

  test "returns ingredients for a recipe" do
    insert!(
      :recipe,
      title: "Pizza",
      ingredients: [
        insert!(:ingredient, name: "Flour")
      ]
    )

    actual = run("
      {
        recipes {
          title
          ingredients {
            quantity
            ingredient {
              name
            }
          }
        }
      }
    ")

    assert actual ===
             {:ok,
              %{
                data: %{
                  "recipes" => [
                    %{
                      "title" => "Pizza",
                      "ingredients" => [
                        %{
                          "quantity" => 1,
                          "ingredient" => %{"name" => "Flour"}
                        }
                      ]
                    }
                  ]
                }
              }}
  end

  test "returns recipe node" do
    recipe =
      insert!(
        :recipe,
        title: "Shoarma",
        image_url:
          "https://res.cloudinary.com/picape/image/fetch/t_all_images,f_auto/https://server/shoarma.jpg"
      )

    actual = run("
      query node($id: ID!) {
        node(id: $id) {
          ... on Recipe {
            title
            imageUrl
          }
        }
      }", variables: %{"id" => Node.to_global_id("Recipe", recipe.id)})

    assert actual ===
             {:ok,
              %{
                data: %{
                  "node" => %{
                    "title" => "Shoarma",
                    "imageUrl" =>
                      "https://res.cloudinary.com/picape/image/fetch/t_all_images,f_auto/https://server/shoarma.jpg"
                  }
                }
              }}
  end

  test "adds new recipe" do
    actual = run("
      mutation add($title: String!) {
        addRecipe(title: $title) {
          title
        }
      }", variables: %{"title" => "Test title"})

    assert actual ===
             {:ok,
              %{
                data: %{
                  "addRecipe" => %{
                    "title" => "Test title"
                  }
                }
              }}
  end
end
