defmodule Picape.Graphql.QueryIngredientTest do
  use Picape.AbsintheCase
  alias Absinthe.Relay.Node

  test "searches by ingredient name" do
    insert!(:ingredient, name: "Flour")
    insert!(:ingredient, name: "Milk")

    actual =
      run("
      query search($query: String!) {
       searchIngredient(query: $query) {
          name
        }
      }",
        variables: %{"query" => "Mil"}
      )

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
        variables: %{
          "query" => "Mil",
          "excluded" => [Node.to_global_id("Ingredient", milk.id)]
        }
      )

    assert actual === {:ok, %{data: %{"searchIngredient" => []}}}
  end

  test "exposes the supermarket product card behind an ingredient" do
    insert!(:ingredient, name: "Milk", supermarket_product_raw: %{"productCard" => product_card()})

    assert {:ok, %{data: %{"searchIngredient" => [details]}}} = run(details_query(), variables: %{"query" => "Mil"})

    assert details === %{
             "price" => 251,
             "priceBeforeBonus" => 279,
             "bonusMechanism" => "1 + 1 gratis",
             "minBestBeforeDays" => 9,
             "unitPriceDescription" => "normale prijs per kg €22.32",
             "supermarketDescription" => "Crème fraîche & boter.",
             "supermarketHighlights" => ["Bewaren: in de koelkast", "Bron van vezels"]
           }
  end

  test "a product without a bonus has a price and nothing to strike through" do
    card = product_card() |> Map.drop(["currentPrice", "bonusMechanism"])
    insert!(:ingredient, name: "Milk", supermarket_product_raw: %{"productCard" => card})

    assert {:ok, %{data: %{"searchIngredient" => [details]}}} = run(details_query(), variables: %{"query" => "Mil"})

    assert %{"price" => 279, "priceBeforeBonus" => nil, "bonusMechanism" => ""} = details
  end

  # A tenth of the production ingredients sit on a product the supermarket has
  # stopped selling, so nothing Picape orders for them ever arrives. Every
  # seeded product used to be in the assortment, so this branch had never run.
  test "an ingredient the supermarket no longer sells carries a warning" do
    card = Map.put(product_card(), "orderAvailabilityStatus", "NO_LONGER_IN_ASSORTMENT")
    insert!(:ingredient, name: "Milk", supermarket_product_raw: %{"productCard" => card})

    assert {:ok, %{data: %{"searchIngredient" => [ingredient]}}} = run(warning_query(), variables: %{"query" => "Mil"})

    assert ingredient === %{
             "warning" => %{
               "description" => "Niet leverbaar",
               "outOfStock" => false,
               "outOfAssortment" => true
             }
           }
  end

  test "an ingredient the supermarket still sells carries no warning" do
    card = Map.put(product_card(), "orderAvailabilityStatus", "IN_ASSORTMENT")
    insert!(:ingredient, name: "Milk", supermarket_product_raw: %{"productCard" => card})

    assert {:ok, %{data: %{"searchIngredient" => [ingredient]}}} = run(warning_query(), variables: %{"query" => "Mil"})

    assert ingredient === %{"warning" => nil}
  end

  defp warning_query do
    "
    query search($query: String!) {
      searchIngredient(query: $query) {
        warning {
          description
          outOfStock
          outOfAssortment
        }
      }
    }"
  end

  defp details_query do
    "
    query search($query: String!) {
      searchIngredient(query: $query) {
        price
        priceBeforeBonus
        bonusMechanism
        minBestBeforeDays
        unitPriceDescription
        supermarketDescription
        supermarketHighlights
      }
    }"
  end

  defp product_card do
    %{
      "currentPrice" => 2.51,
      "priceBeforeBonus" => 2.79,
      "bonusMechanism" => "1 + 1 gratis",
      "minBestBeforeDays" => 9,
      "unitPriceDescription" => "normale prijs per kg €22.32",
      "descriptionHighlights" =>
        "<p>Cr&#xE8;me fra&#xEE;che &amp; boter.</p><p><ul><li><strong>Bewaren: </strong>in de koelkast</li><li>Bron van vezels</li></ul></p>"
    }
  end
end
