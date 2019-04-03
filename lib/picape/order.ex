defmodule Picape.Order do
  import Ecto.Query

  alias Picape.Order.{
    LineFromSupermarket,
    LineFromDb,
    PlannedRecipe,
    ManualIngredient,
    Sync
  }

  alias Picape.{Repo, Supermarket, Recipe, Shopping}

  defmodule(Product, do: defstruct([:id, :quantity]))

  @doc """
  Returns the currently active cart.
  """
  def current() do
#    {:ok, LineFromSupermarket.convert(Supermarket.cart())}
    {:ok, cart} = cart("1")
    {:ok, LineFromDb.convert(cart)}
  end

  def last() do
    {:ok, cart} = cart(last_order_id())
    {:ok, LineFromDb.convert(cart, last_order_id())}
  end

  def by_id(order_id) do
    {:ok, cart} = cart(order_id)
    {:ok, LineFromDb.convert(cart)}
  end

  @doc """
  Plans or unplans (unplan = true) a recipe.
  """
  def plan_recipe(order_id, recipe_id, unplan \\ false) do
    %PlannedRecipe{}
    |> PlannedRecipe.changeset(%{
      line_id: order_id,
      recipe_id: recipe_id,
      unplanned: unplan
    })
    |> Repo.insert(
      on_conflict: [set: [unplanned: unplan]],
      conflict_target: [:line_id, :recipe_id]
    )
    |> case do
      {:ok, _recipe} -> sync_supermarket(order_id)
      err -> err
    end
  end

  def planned_recipes(nil) do
    {:ok, []}
  end

  def cart(order_id) do
    with {:ok, recipe_quantities} <- recipe_ingredient_quantities(order_id),
         {:ok, planned} <- Recipe.item_quantities(recipe_quantities),
         {:ok, manual} <- manual_ingredients(order_id) do
      merged = Map.merge(planned, manual, fn _id, _quantity1, quantity2 -> quantity2 end)
               |> Enum.reject(fn {_, v} -> v == 0 end)
               |> Map.new
      {:ok, ingredients} = Recipe.ingredients_by_item_ids(Map.keys(merged))

      cart = Enum.map(merged, fn {id, quantity} ->
        {id, %{
          id: id,
          ingredient: ingredients[id],
          quantity: quantity
        }}
      end)
      |> Enum.into(%{})

      {:ok, cart}
    end
  end

  @doc """
  Returns a list of planned recipe IDs.
  """
  def planned_recipes(order_id) do
    query =
      from(
        p in PlannedRecipe,
        where: p.line_id == ^order_id and p.unplanned == false,
        select: p.recipe_id
      )

    {:ok, Repo.all(query)}
  end

  @doc """
  Synchronizes planned ingredients with the cart on Supermarket.
  """
  def sync_supermarket(order_id) do
    ensure_order_is_current(order_id)

    with {:ok, recipe_quantities} <- recipe_ingredient_quantities(order_id),
         {:ok, planned} <- Recipe.item_quantities(recipe_quantities),
         {:ok, manual} <- manual_ingredients(order_id),
         {:ok, existing} <- ordered_item_quantities(order_id),
         {:ok, changes} <- Sync.changes(planned, manual, existing) do
      IO.inspect(recipe_quantities, label: "recipe_quantities")
      IO.inspect(planned, label: "planned")
      IO.inspect(manual, label: "manual")
      IO.inspect(existing, label: "existing")
      IO.inspect(changes, label: "changes")

      # Supermarket.apply_changes(changes)

      current()
    end
  end

  def start_shopping(order_id) do
    new_order_id = Integer.to_string(:os.system_time(:micro_seconds))
    finish_order(order_id, new_order_id)

    last()
  end

  def stop_shopping(order_id) do
    order_id = last_order_id()
    {:ok, cart} = cart(order_id)
    items = Map.values(cart)

    with {:ok, bought} <- Shopping.ingredients_bought?(order_id, Enum.map(items, &(&1.ingredient.id))),
         not_bought <- Enum.reject(items, &(bought[&1.ingredient.id])),
         now_bought <- Enum.map(not_bought, &(Shopping.buy_ingredient(order_id, &1.ingredient.id))),
         ordered <- Enum.map(not_bought, &(order_ingredient("1", &1.ingredient.id, &1.quantity)))
    do
      last()
    else
      error -> {:error, error}
    end
  end

  @doc """
  Returns a map of ingredient IDs to a boolean if that recipe was planned or not.
  """
  def ingredients_planned?(order_id, ingredient_ids) do
    with {:ok, recipe_ids} <- planned_recipes(order_id) do
      Recipe.ingredients_in_recipes?(recipe_ids, ingredient_ids)
    end
  end

  def ingredients_ordered_quantity(order_id, ingredient_ids) do
    with {:ok, items} <- ordered_item_quantities(order_id),
         {:ok, items_map} <- Recipe.ingredients_by_item_ids_reverse(Map.keys(items)) do
      {:ok, Map.new(ingredient_ids, fn id -> {id, items[items_map[id]] || 0} end)}
    end
  end

  def order_ingredient(order_id, ingredient_id, quantity) do
    %ManualIngredient{}
    |> ManualIngredient.changeset(%{
      line_id: order_id,
      ingredient_id: ingredient_id,
      quantity: quantity
    })
    |> Repo.insert(
      on_conflict: [set: [quantity: quantity]],
      conflict_target: [:line_id, :ingredient_id]
    )
    |> case do
      {:ok, _planned_recipe} -> current()
      err -> err
    end
  end

  def manual_ingredients(order_id) do
    query =
      from(
        m in ManualIngredient,
        join: i in assoc(m, :ingredient),
        where: m.line_id == ^order_id,
        select: {i.supermarket_product_id, m.quantity}
      )

    {:ok, Enum.into(Repo.all(query), %{})}
  end

  def recipes_planned_for_ingredient_ids(order_id, ingredient_ids) do
    with {:ok, planned_recipe_ids} <- planned_recipes(order_id),
         {:ok, recipes_by_ingredients} <- Recipe.recipes_by_ingredient_ids(ingredient_ids, planned_recipe_ids) do
      {:ok, recipes_by_ingredients}
    end
  end

  def last_order_id() do
    Repo.one(
      from(
        p in PlannedRecipe,
        where: fragment("? ~ ?", p.line_id, "^([0-9]+[.]?[0-9]*|[.][0-9]+)$"),
        select: max(p.line_id)
      )
    )
  end

  # --- private

  defp ensure_order_is_current(order_id) do
    with latest_order_id <- last_order_id(),
         false <- planned_items_in_order?(latest_order_id) do
      finish_order(order_id, latest_order_id)
    end
  end

  defp finish_order(order_id, latest_order_id) do
    from(p in PlannedRecipe, where: p.line_id == ^order_id)
    |> Repo.update_all(set: [line_id: latest_order_id])

    from(i in ManualIngredient, where: i.line_id == ^order_id)
    |> Repo.update_all(set: [line_id: latest_order_id])
  end

  defp planned_items_in_order?(order_id) do
    with [] <- Repo.all(from(p in PlannedRecipe, where: p.line_id == ^order_id, limit: 1)),
         [] <-
           Repo.all(
             from(
               m in ManualIngredient,
               where: m.line_id == ^order_id,
               limit: 1
             )
           ) do
      false
    else
      _ -> true
    end
  end

  defp planned_ingredients(order_id) do
    all =
      from(
        m in ManualIngredient,
        where: m.line_id == ^order_id
      )
      |> Repo.all()
      |> Repo.preload(:ingredient)

    {:ok, all}
  end

  defp recipe_ingredient_quantities(order_id) do
    query =
      from(
        p in PlannedRecipe,
        where: p.line_id == ^order_id,
        select: {p.recipe_id, fragment("? * Cast(NOT ? as integer)", p.quantity, p.unplanned)}
      )

    {:ok, Enum.into(Repo.all(query), %{})}
  end

  defp ordered_item_quantities(order_id) do
    {:ok, order} = by_id(order_id)

    existing =
      Enum.reduce(order.items, %{}, fn item, acc ->
        Map.update(acc, item.id, item.quantity, &(&1 + 2))
      end)

    {:ok, existing}
  end
end
