defmodule Picape.Graphql.SubscriptionIngredientTest do
  use Picape.SubscriptionCase
  import Picape.Factory
  alias Absinthe.Relay.Node

  test "ordered ingredients can be subscribed to", %{socket: socket} do
    ingredient = insert!(:ingredient, name: "Flour", supermarket_product_id: 12)

    # Register a subscription
    subscription = "subscription {
      orderChanged { totalCount }
    }"
    ref = push_doc(socket, subscription)
    assert_reply(ref, :ok, %{subscriptionId: subscription_id})

    # run a mutation to trigger the subscription
    mutation = "mutation orderIngredient($ingredientId: ID!, $quantity: Int) {
      orderIngredient(ingredientId: $ingredientId, quantity: $quantity) { orderedQuantity }
    }"

    ref =
      push_doc(
        socket,
        mutation,
        variables: %{ingredientId: Node.to_global_id("Ingredient", ingredient.id), quantity: 2}
      )

    assert_reply(ref, :ok, %{data: %{"orderIngredient" => %{"orderedQuantity" => 2}}})

    # check to see if we got subscription data
    expected = %{
      result: %{data: %{"orderChanged" => %{"totalCount" => 1}}},
      subscriptionId: subscription_id
    }

    assert_push("subscription:data", push)
    assert push == expected
  end
end
