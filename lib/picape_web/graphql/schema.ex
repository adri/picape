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
    field :recipes, list_of(:recipe) do
      resolve &Resolver.Recipe.all/3
    end

    field :essentials, list_of(:ingredient) do
      resolve &Resolver.Recipe.essentials/3
    end

    field :current_order, :order do
      resolve &Resolver.Order.current/3
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
      |> Enum.map(fn({key, {value, context}}) ->
           [message: "#{key} #{value}", details: context]
         end)
    {:error, errors}
  end

# Subscription example: https://github.com/absinthe-graphql/absinthe_phoenix
end
