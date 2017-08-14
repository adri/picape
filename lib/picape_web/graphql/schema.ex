defmodule PicapeWeb.Graphql.Schema do
  use Absinthe.Schema
  use Absinthe.Relay.Schema

  alias PicapeWeb.Graphql.Resolver
  import_types PicapeWeb.Graphql.Types

  @node_id_rules %{
      recipe_id: :recipe,
      ingredient_id: :ingredient,
  }

  node interface do
    resolve_type fn
      %Picape.Recipe.Recipe{}, _ -> :recipe
      %Picape.Recipe.Ingredient{}, _ -> :ingredient
      _, _ -> nil
    end
  end

  query do
    node field do
      resolve fn
        %{type: :recipe, id: id}, _ ->
          id
          |> String.to_integer
          |> Resolver.Recipe.recipe_by_id
        %{type: :ingredient, id: id}, _ ->
          id
          |> String.to_integer
          |> Resolver.Recipe.ingredient_by_id
      end
    end

    field :recipes, list_of(:recipe) do
      resolve &Resolver.Recipe.all/3
    end

    field :essentials, list_of(:ingredient) do
      resolve &Resolver.Recipe.essentials/3
    end

    field :ingredients, :ingredient_connection do
      arg :first, non_null(:integer)
      resolve &Resolver.Recipe.list_ingredients/3
    end

    field :current_order, :order do
      resolve &Resolver.Order.current/3
    end

    field :search_supermarket, list_of(:supermarket_search_result) do
      arg :query, non_null(:string)
      resolve &Resolver.Supermarket.search/3
    end

    field :search_ingredient, list_of(:ingredient) do
      arg :query, non_null(:string)
      arg :ignore_ids, list_of(:id)
      resolve &Resolver.Recipe.search_ingredient/3
    end
  end

  mutation do
    @desc "Plan a recipe and order ingredients."
    field :plan_recipe, :order do
      arg :recipe_id, non_null(:id)
      resolve handle_errors(parsing_node_ids(&Resolver.Order.plan_recipe/2, @node_id_rules))
    end

    @desc "Remove a planned recipe."
    field :unplan_recipe, :order do
      arg :recipe_id, non_null(:id)
      resolve handle_errors(parsing_node_ids(&Resolver.Order.unplan_recipe/2, @node_id_rules))
    end

    @desc "Updates and synchronizes the current order."
    field :sync_order, :order do
      resolve handle_errors(parsing_node_ids(&Resolver.Order.sync_supermarket/2, @node_id_rules))
    end

    @desc "Order an ingredient"
    field :order_ingredient, :order do
      arg :ingredient_id, non_null(:id)
      arg :quantity, non_null(:integer), default_value: 1
      resolve handle_errors(parsing_node_ids(&Resolver.Order.order_ingredient/2, @node_id_rules))
    end

    @desc "Add ingredient"
    field :add_ingredient, :ingredient do
      arg :name, non_null(:string)
      arg :is_essential, non_null(:boolean)
      arg :supermarket_product_id, non_null(:string)
      resolve handle_errors(&Resolver.Recipe.add_ingredient/3)
    end

    @desc "Edit recipe"
    field :edit_recipe, :recipe do
      arg :title, non_null(:string)
      arg :igredients, non_null(list_of(:id))
      resolve handle_errors(&Resolver.Recipe.edit_recipe/3)
    end
  end

  def handle_errors(fun) do
    fn source, args, info ->
      case Absinthe.Resolution.call(fun, source, args, info) do
        {:error, %Ecto.Changeset{} = changeset} -> format_changeset(changeset)
        val -> val
      end
    end
  end

  def format_changeset(changeset) do
    #{:error, [email: {"has already been taken", []}]}
    errors = changeset.errors
      |> Enum.map(fn({key, {value, _context}}) ->
           [message: "#{key} #{value}"]
         end)
    {:error, errors}
  end

# Subscription example: https://github.com/absinthe-graphql/absinthe_phoenix
end
