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
    field :ingredient, :ingredient do
      resolve batched({Resolver.Recipe, :ingredients_by_item_ids})
    end
  end

  object :supermarket_search_result do
    field :id, :string
    field :name, :string
    field :price, :string
    field :image_url, :string
    field :unit_quantity, :string
  end

  node object :recipe do
    field :title, :string
    field :is_planned, :boolean do
      resolve batched({Resolver.Order, :recipies_planned?})
    end
    field :ingredients, list_of(:ingredient) do
      resolve batched({Resolver.Recipe, :ingredients_by_recipe_ids})
    end
  end

  object :ingredient_edge do
    field :quantity, :integer
    field :ingredient, :ingredient
  end

  node object :ingredient do
    field :name, :string
    field :is_essential, :boolean
    field :image_url, :string do
      resolve fn _, %{source: source} ->
        {:ok, source[:image_url]}
      end
    end
    field :is_planned, :boolean do
      resolve batched({Resolver.Order, :ingredients_planned?})
    end
    field :ordered_quantity, :integer do
      resolve batched({Resolver.Order, :ingredients_ordered_quantity})
    end
    field :unit_quantity, :string do
      resolve fn _, %{source: source} ->
        {:ok, source[:unit_quantity]}
      end
    end
  end

  connection node_type: :ingredient


  defp batched(batch_fun) do
    fn parent, _args, _ctx ->
      batch(batch_fun, parent.id, fn batch_results ->
        {:ok, Map.get(batch_results, parent.id)}
      end)
    end
  end
end
