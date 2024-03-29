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

    field :warning, :string do
      resolve(fn parent, _args, _ctx ->
        batch({Resolver.Recipe, :ingredients_by_recipe_ids}, parent.id, fn results ->
          {:ok, batch_results} = results

          case Enum.find(batch_results[parent.id], &(&1.ingredient[:warning] != nil)) do
            nil -> {:ok, nil}
            ref -> {:ok, ref.ingredient[:warning].description}
          end
        end)
      end)
    end

    field(:is_planned, :boolean, resolve: batched({Resolver.Order, :recipes_planned?}))

    field(:ingredients, list_of(:recipe_ingredient_edge),
      resolve: batched({Resolver.Recipe, :ingredients_by_recipe_ids})
    )

    field(:is_cooked, :boolean, resolve: batched({Resolver.Order, :recipes_cooked?}))
  end

  node object(:ingredient) do
    field(:name, :string)
    field(:seasonal_name, :string)
    field(:supermarket_product_id, :string)
    field(:is_essential, :boolean)
    field(:tags, list_of(:ingredient_tag))
    field(:image_url, :string, resolve: from_object(:image_url))
    field(:supermarket_name, :string, resolve: from_object(:original_title))
    field(:nutriscore, :string, resolve: from_object(:nutriscore))
    field(:warning, :ingredient_warning, resolve: from_object(:warning))

    field :is_planned, :boolean do
      arg(:in_shopping_list, :boolean, default_value: false)

      resolve(fn parent, args, _ctx ->
        batch_fn =
          cond do
            args.in_shopping_list -> {Resolver.Order, :ingredients_in_shopping?}
            true -> {Resolver.Order, :ingredients_planned?}
          end

        batch(batch_fn, parent.id, fn results ->
          {:ok, batch_results} = results
          {:ok, Map.get(batch_results, parent.id)}
        end)
      end)
    end

    field :ordered_quantity, :integer do
      arg(:in_shopping_list, :boolean, default_value: false)

      resolve(fn parent, args, _ctx ->
        batch_fn =
          cond do
            args.in_shopping_list -> {Resolver.Order, :ingredients_shopping_quantity}
            true -> {Resolver.Order, :ingredients_ordered_quantity}
          end

        batch(batch_fn, parent.id, fn results ->
          {:ok, batch_results} = results
          {:ok, Map.get(batch_results, parent.id)}
        end)
      end)
    end

    field :planned_recipes, list_of(:recipe_edge) do
      arg(:in_shopping_list, :boolean, default_value: false)

      resolve(fn parent, args, _ctx ->
        batch_fn =
          cond do
            args.in_shopping_list -> {Resolver.Order, :recipes_shopping_for_ingredient_ids}
            true -> {Resolver.Order, :recipes_planned_for_ingredient_ids}
          end

        batch(batch_fn, parent.id, fn results ->
          {:ok, batch_results} = results
          {:ok, Map.get(batch_results, parent.id)}
        end)
      end)
    end

    field(
      :is_bought,
      :boolean,
      resolve: batched({Resolver.Shopping, :ingredients_bought?})
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

  object :recipe_warning do
    field(:out_of_stock, :boolean)
    field(:out_of_assortment, :boolean)
    field(:description, :string)
  end

  object :ingredient_warning do
    field(:out_of_stock, :boolean)
    field(:out_of_assortment, :boolean)
    field(:description, :string)
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

  defp batched(batch_fun, options \\ []) do
    fn parent, _args, _resolution ->
      batch(
        batch_fun,
        parent.id,
        fn results ->
          {:ok, batch_results} = results
          {:ok, Map.get(batch_results, parent.id)}
        end,
        options
      )
    end
  end

  defp from_object(key) do
    fn parent, _args, _ctx ->
      {:ok, parent[key]}
    end
  end
end
