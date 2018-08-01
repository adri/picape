defmodule PicapeWeb.Graphql.Types do
  use Absinthe.Schema.Notation
  use Absinthe.Relay.Schema.Notation, :modern

  alias PicapeWeb.Graphql.Resolver

  @desc "Current order, there can only be one order at a time."
  node object(:order) do
    field(:total_count, :integer)
    field(:total_price, :integer)
    field(:items, list_of(:order_item))
  end

  @desc "Item that is part of an order"
  node object(:order_item) do
    field(:name, :string)
    field(:image_url, :string)
    field(:quantity, :string)

    field(
      :ingredient,
      :ingredient,
      resolve: batched({Resolver.Recipe, :ingredients_by_item_ids})
    )
  end

  @desc "Recipe containing ingredients and metadata"
  node object(:recipe) do
    field(:title, :string)
    field(:description, :string)
    field(:image_url, :string, resolve: from_object(:image_url))

    field(
      :is_planned,
      :boolean,
      resolve: batched({Resolver.Order, :recipies_planned?})
    )

    field(
      :ingredients,
      list_of(:recipe_ingredient_edge),
      resolve: batched({Resolver.Recipe, :ingredients_by_recipe_ids})
    )
  end

  node object(:ingredient) do
    field(:name, :string)
    field(:seasonal_name, :string)
    field(:supermarket_product_id, :string)
    field(:is_essential, :boolean)
    field(:tags, list_of(:ingredient_tag))
    field(:image_url, :string, resolve: from_object(:image_url))

    field(
      :is_planned,
      :boolean,
      resolve: batched({Resolver.Order, :ingredients_planned?})
    )

    field(
      :ordered_quantity,
      :integer,
      resolve: batched({Resolver.Order, :ingredients_ordered_quantity})
    )

    field(
      :planned_recipes,
      list_of(:recipe_edge),
      resolve: batched({Resolver.Order, :recipes_planned_for_ingredient_ids})
    )

    field(:season, :season,
      resolve: fn parent, _args, _ctx ->
        {:ok, List.first(Map.values(Resolver.Recipe.seasons_for_ingredients([parent])))}
      end
    )

    field(:unit_quantity, :string, resolve: from_object(:unit_quantity))
  end

  node object(:ingredient_tag) do
    field(:count, :integer)
    field(:name, :string)
  end

  @desc "Filtering options for the ingredients"
  input_object :ingredient_filter do
    @desc "Matching a tag"
    field(:tag_ids, list_of(:id))
    @desc "Ingredient is marked as an essential"
    field(:essential, :boolean)
  end

  @desc "Ordering options for the ingredients"
  input_object :ingredient_order do
    @desc "Field to sort on"
    field(:field, :ingredient_order_field)
    @desc "Direction to sort on"
    field(:direction, :order_direction)
  end

  @desc "Fields that ingredients can be sorted on"
  enum :ingredient_order_field do
    value(:name, description: "Sort by ingredient name")
  end

  @desc "Direction to sort in"
  enum :order_direction do
    value(:asc, description: "Ascending")
    value(:desc, description: "Descending")
  end

  @desc "Edit an ingredient"
  input_object :edit_ingredient_input do
    field(:ingredient_id, non_null(:id))
    field(:supermarket_product_id, non_null(:string))
    field(:name, non_null(:string))
    field(:seasonal_name, :string)
    field(:is_essential, non_null(:boolean))
    field(:tag_ids, list_of(:id))
  end

  object :season do
    field(:label, :string)
  end

  object :recipe_ingredient_edge do
    field(:quantity, :integer)
    field(:ingredient, :ingredient)
  end

  object :recipe_edge do
    field(:quantity, :integer)
    field(:recipe, :recipe)
  end

  object :ingredient_edge do
    field(:node, :ingredient)
  end

  object :supermarket_search_result do
    field(:id, :string)
    field(:name, :string)
    field(:price, :string)
    field(:image_url, :string)
    field(:unit_quantity, :string)
  end

  connection node_type: :ingredient do
    @desc "Ingredient tags and their counts"
    field :tags, list_of(:ingredient_tag) do
      resolve(&Resolver.Recipe.list_ingredient_tags/3)
    end
  end

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
