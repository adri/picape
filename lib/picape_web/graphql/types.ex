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
    field :image_url, :string
    field :is_planned, :boolean, resolve: batched({Resolver.Order, :recipies_planned?})
    field :ingredients, list_of(:ingredient), resolve: batched({Resolver.Recipe, :ingredients_by_recipe_ids})
  end

  node object :ingredient do
    field :name, :string
    field :is_essential, :boolean
    field :image_url, :string, resolve: from_object(:image_url)
    field :is_planned, :boolean, resolve: batched({Resolver.Order, :ingredients_planned?})
    field :ordered_quantity, :integer, resolve: batched({Resolver.Order, :ingredients_ordered_quantity})
    field :unit_quantity, :string, resolve: from_object(:unit_quantity)
  end

  object :ingredient_edge do
    field :quantity, :integer
    field :ingredient, :ingredient
  end

  object :supermarket_search_result do
    field :id, :string
    field :name, :string
    field :price, :string
    field :image_url, :string
    field :unit_quantity, :string
  end

  connection node_type: :ingredient

  @doc """
  Helper to collect all IDs of a parent and send it to a batch function.
  """
  defp batched(batch_fun) do
    fn parent, _args, _ctx ->
      batch(batch_fun, parent.id, fn batch_results ->
        {:ok, Map.get(batch_results, parent.id)}
      end)
    end
  end

  @doc """
  Helper to access a dynamic property on a parent.
  """
  defp from_object(key) do
    fn parent, _args, _ctx ->
      {:ok, parent[key]}
    end
  end
end
