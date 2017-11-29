defmodule Picape.Graphql.SubscriptionRecipeTest do
  use Picape.SubscriptionCase
  import Picape.Factory
  alias Absinthe.Relay.Node

  @tag :skip
  test "planned recipes can be subscribed to", %{socket: socket} do
    recipe = insert! :recipe, title: "Pizza", ingredients: [
      insert!(:ingredient, name: "Flour")
    ]

    # Register a subscription
    subscription = "subscription recipePlanned {
      recipePlanned { title }
    }"
    ref = push_doc socket, subscription
    assert_reply ref, :ok, %{subscriptionId: subscription_id}

    # run a mutation to trigger the subscription
    mutation = "mutation planRecipe($recipeId: ID!) {
      planRecipe(recipeId: $recipeId) { title }
    }"
    ref = push_doc socket, mutation, variables: %{recipeId: Node.to_global_id("Recipe", recipe.id)}
    assert_reply ref, :ok, %{data: %{"planRecipe" => %{"title" => "Pizza"}}}

    # check to see if we got subscription data
    expected = %{
      result: %{data: %{"recipePlanned" => %{"title" => "Pizza"}}},
      subscriptionId: subscription_id
    }
    assert_push "subscription:data", push
    assert push == expected
  end

  @tag :skip
  test "unplanned recipes can be subscribed to", %{socket: socket} do
    recipe = insert! :recipe, title: "Pizza", ingredients: [
      insert!(:ingredient, name: "Flour")
    ]

    # Register a subscription
    subscription = "subscription recipeUnplanned {
      recipeUnplanned { title }
    }"
    ref = push_doc socket, subscription
    assert_reply ref, :ok, %{subscriptionId: subscription_id}

    # run a mutation to plan a recipe
    mutation = "mutation planRecipe($recipeId: ID!) {
      planRecipe(recipeId: $recipeId) { title }
    }"
    ref = push_doc socket, mutation, variables: %{recipeId: Node.to_global_id("Recipe", recipe.id)}
    assert_reply ref, :ok, %{data: %{"planRecipe" => %{"title" => "Pizza"}}}

    # run a mutation to unplan the recipe and trigger the subscription
    mutation = "mutation unplanRecipe($recipeId: ID!) {
      unplanRecipe(recipeId: $recipeId) { title }
    }"
    ref = push_doc socket, mutation, variables: %{recipeId: Node.to_global_id("Recipe", recipe.id)}
    assert_reply ref, :ok, %{data: %{"unplanRecipe" => %{"title" => "Pizza"}}}

    # check to see if we got subscription data
    expected = %{
      result: %{data: %{"recipeUnplanned" => %{"title" => "Pizza"}}},
      subscriptionId: subscription_id
    }
    assert_push "subscription:data", push
    assert push == expected
  end
end
