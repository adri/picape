defmodule Picape.MCP.Tools do
  @moduledoc """
  The tools `Picape.MCP` exposes, and their implementation on top of the
  `Picape.*` contexts.

  IDs are the plain database IDs the contexts use, not the Relay global IDs the
  GraphQL API hands out.
  """

  alias Picape.{Ingredients, Order, Recipe, Supermarket}

  # The GraphQL resolvers hardcode the same order id: there is one open order.
  @order_id "1"

  @string %{type: "string"}
  @integer %{type: "integer"}

  @tools [
    %{
      name: "search_ingredients",
      description:
        "Search the ingredients Picape already knows, by name. Returns the ID you need to put an " <>
          "ingredient on the shopping list, plus how many are on it right now.",
      inputSchema: %{
        type: "object",
        properties: %{
          query: %{type: "string", description: "Part of an ingredient name, in Dutch"},
          exclude_ids: %{type: "array", items: @integer, description: "Ingredient IDs to leave out"}
        },
        required: ["query"]
      }
    },
    %{
      name: "search_supermarket",
      description:
        "Search the supermarket's product catalogue for products Picape does not know yet. The `id` " <>
          "in the result is a supermarket product ID, not a Picape ingredient ID; pass it to add_ingredient.",
      inputSchema: %{
        type: "object",
        properties: %{query: %{type: "string", description: "Part of a product name, in Dutch"}},
        required: ["query"]
      }
    },
    %{
      name: "get_shopping_list",
      description:
        "Read the current order: every item in the supermarket cart with its quantity, plus the total " <>
          "item count and price in cents. Items that map to a Picape ingredient carry that ingredient " <>
          "and the recipes that asked for it.",
      inputSchema: %{type: "object", properties: %{}}
    },
    %{
      name: "set_ingredient_quantity",
      description:
        "Put an ingredient on the shopping list, change how many are on it, or take it off. Quantity 0 " <>
          "removes the ingredient. This is a manual override on top of what the planned recipes ask for.",
      inputSchema: %{
        type: "object",
        properties: %{
          ingredient_id: @integer,
          quantity: %{type: "integer", minimum: 0, description: "How many to order. 0 removes the ingredient."}
        },
        required: ["ingredient_id", "quantity"]
      }
    },
    %{
      name: "add_ingredient",
      description:
        "Teach Picape a new ingredient, backed by a supermarket product. Find the product with " <>
          "search_supermarket first and pass its `id`. Adding an ingredient does not put it on the " <>
          "shopping list; use set_ingredient_quantity for that.",
      inputSchema: %{
        type: "object",
        properties: %{
          name: %{type: "string", description: "The name Picape shows, in Dutch"},
          supermarket_product_id: %{type: "integer", description: "The `id` from a search_supermarket result"},
          is_essential: %{
            type: "boolean",
            description: "Essentials are staples you always have; they are left out of recipe totals"
          }
        },
        required: ["name", "supermarket_product_id"]
      }
    },
    %{
      name: "list_recipes",
      description:
        "List every recipe with its ingredients and whether it is planned. Picape has no recipe search, " <>
          "so this tool fetches all recipes and filters them on title here when you pass a query.",
      inputSchema: %{
        type: "object",
        properties: %{query: %{type: "string", description: "Keep only recipes whose title contains this text"}}
      }
    },
    %{
      name: "get_recipe",
      description: "Read one recipe with its description, image and ingredient quantities.",
      inputSchema: %{type: "object", properties: %{recipe_id: @integer}, required: ["recipe_id"]}
    },
    %{
      name: "add_recipe",
      description:
        "Create a recipe with a title. Picape can only create an empty recipe, so give it ingredients " <>
          "afterwards with edit_recipe.",
      inputSchema: %{type: "object", properties: %{title: @string}, required: ["title"]}
    },
    %{
      name: "edit_recipe",
      description:
        "Replace a recipe's title, description, image and ingredients. The ingredient list is replaced " <>
          "wholesale, so read the recipe first and send back every ingredient you want to keep.",
      inputSchema: %{
        type: "object",
        properties: %{
          recipe_id: @integer,
          title: @string,
          description: @string,
          image_url: @string,
          ingredients: %{
            type: "array",
            description: "The complete ingredient list after the edit",
            items: %{
              type: "object",
              properties: %{ingredient_id: @integer, quantity: %{type: "integer", minimum: 1}},
              required: ["ingredient_id", "quantity"]
            }
          }
        },
        required: ["recipe_id", "title", "ingredients"]
      }
    },
    %{
      name: "plan_recipe",
      description:
        "Plan a recipe for the current order. Its ingredients are added to the shopping list, on top of " <>
          "what the other planned recipes already ask for.",
      inputSchema: %{type: "object", properties: %{recipe_id: @integer}, required: ["recipe_id"]}
    },
    %{
      name: "unplan_recipe",
      description:
        "Take a recipe off the current order. Its ingredients leave the shopping list unless another " <>
          "planned recipe still needs them.",
      inputSchema: %{type: "object", properties: %{recipe_id: @integer}, required: ["recipe_id"]}
    }
  ]

  @tool_names Enum.map(@tools, & &1.name)

  @spec list() :: [map]
  def list, do: @tools

  @doc """
  Runs one tool. Anything the contexts raise becomes a tool error, so a bad
  argument ends one call instead of the session.
  """
  @spec call(binary, map) :: {:ok, term} | {:error, binary} | :unknown_tool
  def call(name, arguments) do
    if name in @tool_names do
      run(name, arguments)
    else
      :unknown_tool
    end
  rescue
    error -> {:error, Exception.message(error)}
  end

  defp run("search_ingredients", args) do
    filter = [name: args["query"], excluded: args["exclude_ids"] || []]

    {:ok, render_ingredients(Ingredients.list(filter: filter))}
  end

  defp run("search_supermarket", args) do
    products =
      args["query"]
      |> Supermarket.search()
      |> Enum.map(&%{id: &1.id, name: &1.name, price: &1.price, unit_quantity: &1.unit_quantity})

    {:ok, products}
  end

  defp run("get_shopping_list", _args) do
    {:ok, line} = Order.current()
    {:ok, ingredients} = Recipe.ingredients_by_item_ids(Enum.map(line.items, & &1.id))
    {:ok, recipes} = Order.recipes_planned_for_ingredient_ids(@order_id, Enum.map(Map.values(ingredients), & &1.id))

    items =
      Enum.map(line.items, fn item ->
        %{
          name: item.name,
          quantity: item.quantity,
          ingredient: render_list_ingredient(ingredients[item.id], recipes)
        }
      end)

    {:ok, %{total_count: line.total_count, total_price: line.total_price, items: items}}
  end

  defp run("set_ingredient_quantity", args) do
    with {:ok, ingredient} <- fetch_ingredient(args["ingredient_id"]),
         {:ok, _line} <- Order.order_ingredient(@order_id, ingredient.id, args["quantity"]) do
      {:ok, List.first(render_ingredients([ingredient]))}
    end
  end

  defp run("add_ingredient", args) do
    %{
      name: args["name"],
      supermarket_product_id: args["supermarket_product_id"],
      is_essential: args["is_essential"] || false
    }
    |> Ingredients.add_ingredient()
    |> case do
      {:ok, ingredient} -> {:ok, List.first(render_ingredients([ingredient]))}
      {:error, changeset} -> {:error, inspect(changeset.errors)}
    end
  end

  defp run("list_recipes", args) do
    recipes =
      case args["query"] do
        nil -> Recipe.list_recipes()
        query -> Enum.filter(Recipe.list_recipes(), &title_matches?(&1, query))
      end

    {:ok, render_recipes(recipes)}
  end

  defp run("get_recipe", args) do
    with {:ok, recipe} <- fetch_recipe(args["recipe_id"]) do
      {:ok, List.first(render_recipes([recipe]))}
    end
  end

  defp run("add_recipe", args) do
    case Recipe.add_recipe(%{title: args["title"]}) do
      {:ok, recipe} -> {:ok, List.first(render_recipes([recipe]))}
      {:error, changeset} -> {:error, inspect(changeset.errors)}
    end
  end

  defp run("edit_recipe", args) do
    with {:ok, recipe} <- fetch_recipe(args["recipe_id"]) do
      %{
        id: recipe.id,
        title: args["title"],
        description: args["description"],
        image_url: args["image_url"],
        ingredients: Enum.map(args["ingredients"], &%{ingredient_id: &1["ingredient_id"], quantity: &1["quantity"]})
      }
      |> Recipe.edit_recipe()
      |> case do
        {:ok, edited} -> {:ok, List.first(render_recipes([edited]))}
        {:error, changeset} -> {:error, inspect(changeset.errors)}
      end
    end
  end

  defp run("plan_recipe", args), do: plan(args["recipe_id"], false)

  defp run("unplan_recipe", args), do: plan(args["recipe_id"], true)

  defp plan(recipe_id, unplan) do
    with {:ok, recipe} <- fetch_recipe(recipe_id),
         {:ok, _line} <- Order.plan_recipe(@order_id, recipe.id, unplan) do
      {:ok, List.first(render_recipes([recipe]))}
    end
  end

  defp fetch_recipe(id) do
    case Recipe.recipes_by_ids([id]) do
      {:ok, %{^id => recipe}} -> {:ok, recipe}
      _ -> {:error, "no recipe with id #{inspect(id)}"}
    end
  end

  defp fetch_ingredient(id) do
    case Ingredients.ingredients_by_ids([id]) do
      {:ok, %{^id => ingredient}} -> {:ok, ingredient}
      _ -> {:error, "no ingredient with id #{inspect(id)}"}
    end
  end

  defp title_matches?(recipe, query) do
    String.contains?(String.downcase(recipe.title), String.downcase(query))
  end

  defp render_ingredients(ingredients) do
    {:ok, quantities} = Order.ingredients_ordered_quantity(@order_id, Enum.map(ingredients, & &1.id))

    Enum.map(ingredients, fn ingredient ->
      %{
        id: ingredient.id,
        name: ingredient.name,
        is_essential: ingredient.is_essential,
        supermarket_product_id: ingredient.supermarket_product_id,
        unit_quantity: ingredient[:unit_quantity],
        nutriscore: ingredient[:nutriscore],
        warning: warning_description(ingredient),
        ordered_quantity: quantities[ingredient.id]
      }
    end)
  end

  defp render_list_ingredient(nil, _recipes), do: nil

  defp render_list_ingredient(ingredient, recipes) do
    planned =
      Enum.map(recipes[ingredient.id] || [], fn ref ->
        %{quantity: ref.quantity, recipe_id: ref.recipe.id, title: ref.recipe.title}
      end)

    %{id: ingredient.id, name: ingredient.name, planned_recipes: planned}
  end

  defp render_recipes(recipes) do
    {:ok, refs} = Recipe.ingredients_by_recipe_ids(Enum.map(recipes, & &1.id))
    {:ok, planned_ids} = Order.planned_recipes(@order_id)

    Enum.map(recipes, fn recipe ->
      %{
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        image_url: recipe[:image_url],
        is_planned: recipe.id in planned_ids,
        ingredients: Enum.map(refs[recipe.id] || [], &render_recipe_ingredient/1)
      }
    end)
  end

  defp render_recipe_ingredient(ref) do
    %{ingredient_id: ref.ingredient.id, name: ref.ingredient.name, quantity: ref.quantity}
  end

  defp warning_description(ingredient) do
    case ingredient[:warning] do
      %{description: description} -> description
      _ -> nil
    end
  end
end
