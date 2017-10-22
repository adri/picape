defmodule PicapeWeb.Graphql.Types do
  use Absinthe.Schema.Notation
  use Absinthe.Relay.Schema.Notation

  alias PicapeWeb.Graphql.Resolver

  node object :order do
    field :total_count, :integer
    field :total_price, :integer
    field :items, list_of(:order_item)
  end

  node object :order_item do
    field :name, :string
    field :image_url, :string
    field :quantity, :string
    field :ingredient, :ingredient, resolve: batched({Resolver.Recipe, :ingredients_by_item_ids})
  end

  node object :recipe do
    field :title, :string
    field :description, :string
    field :image_url, :string, resolve: from_object(:image_url)
    field :is_planned, :boolean, resolve: batched({Resolver.Order, :recipies_planned?})
    field :ingredients, list_of(:recipe_ingredient_edge), resolve: batched({Resolver.Recipe, :ingredients_by_recipe_ids})
  end

  node object :ingredient do
    field :name, :string
    field :is_essential, :boolean
    field :image_url, :string, resolve: from_object(:image_url)
    field :is_planned, :boolean, resolve: batched({Resolver.Order, :ingredients_planned?})
    field :ordered_quantity, :integer, resolve: batched({Resolver.Order, :ingredients_ordered_quantity})
    field :planned_recipes, list_of(:recipe_edge), resolve: batched({Resolver.Order, :recipes_planned_for_ingredient_ids})
    field :unit_quantity, :string, resolve: from_object(:unit_quantity)
  end

  object :recipe_ingredient_edge do
    field :quantity, :integer
    field :ingredient, :ingredient
  end

  object :recipe_edge do
    field :quantity, :integer
    field :recipe, :recipe
  end

  object :supermarket_search_result do
    field :id, :string
    field :name, :string
    field :price, :string
    field :image_url, :string
    field :unit_quantity, :string
  end

  connection node_type: :ingredient

  defp batched(batch_fun) do
    fn parent, _args, _ctx ->
      batch(batch_fun, parent.id, fn results ->
        {:ok, batch_results} = results
        {:ok, Map.get(batch_results, parent.id)}
      end)
    end
  end

  defp from_object(key) do
    fn parent, _args, _ctx ->
      {:ok, parent[key]}
    end
  end
end
