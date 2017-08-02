defmodule PicapeWeb.Graphql.Types do
  use Absinthe.Schema.Notation
  use Absinthe.Relay.Schema.Notation

  alias PicapeWeb.Graphql.Resolver

  @desc """
  A user of the blog
  """
  object :user do
    field :id, :id
    field :name, :string
  end

  node object :recipe do
    field :title, :string
    field :is_planned, :boolean do
      resolve fn (recipe, _, _) ->
        batch({Resolver.Order, :recipies_planned?}, recipe.id, fn batch_results ->
          {:ok, Map.get(batch_results, recipe.id)}
        end)
      end
    end
    field :ingredients, list_of(:ingredient_edge)
  end

  object :ingredient_edge do
    field :quantity, :integer
    field :ingredient, :ingredient
  end

  node object :ingredient do
    field :name, :string
    field :image_url, :string do
      resolve fn _, %{source: source} ->
        {:ok, source[:image_url]}
      end
    end
    field :is_planned, :boolean do
      resolve fn (ingredient, _, _) ->
         batch({Resolver.Order, :ingredients_planned?}, ingredient.id, fn batch_results ->
             {:ok, Map.get(batch_results, ingredient.id)}
         end)
      end
    end
    field :ordered_quantity, :integer do
      resolve fn (ingredient, _, _) ->
         batch({Resolver.Order, :ingredients_ordered_quantity}, ingredient.id, fn batch_results ->
             {:ok, Map.get(batch_results, ingredient.id)}
         end)
      end
    end
    field :unit_quantity, :string do
      resolve fn _, %{source: source} ->
        {:ok, source[:unit_quantity]}
      end
    end
  end

  node object :order do
    field :total_count, :integer
    field :total_price, :integer
    field :items, list_of(:order_item)
  end

  node object :order_item do
    field :name, :string
    field :image_url, :string
  end
end
