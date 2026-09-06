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
    {:ok, LineFromSupermarket.convert(Supermarket.cart())}
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

  @doc """
  Marks a recipe as cooked or uncooked (cooked = false).
  """
  def mark_recipe_as_cooked(order_id, recipe_id, cooked) do
    %PlannedRecipe{}
    |> PlannedRecipe.changeset(%{
      line_id: order_id,
      recipe_id: recipe_id,
      cooked: cooked
    })
    |> Repo.insert(
      on_conflict: [set: [cooked: cooked]],
      conflict_target: [:line_id, :recipe_id]
    )
  end

  def cart(order_id) do
    with {:ok, recipe_quantities} <- recipe_ingredient_quantities(order_id),
         {:ok, planned} <- Recipe.item_quantities(recipe_quantities),
         {:ok, manual} <- manual_ingredients(order_id) do
      merged =
        Map.merge(planned, manual, fn _id, _quantity1, quantity2 -> quantity2 end)
        |> Enum.reject(fn {_, v} -> v == 0 end)
        |> Map.new()

      {:ok, ingredients} = Recipe.ingredients_by_item_ids(Map.keys(merged))

      cart =
        Enum.map(merged, fn {id, quantity} ->
          {id,
           %{
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
  def planned_recipes(nil) do
    {:ok, []}
  end

  def planned_recipes(order_id) do
    query =
      from(
        p in PlannedRecipe,
        where: p.line_id == ^order_id and p.unplanned == false,
        select: p.recipe_id
      )

    {:ok, Repo.all(query)}
  end

  def cooked_recipes(nil) do
    {:ok, []}
  end

  @doc """
  Returns a list of cooked recipe IDs.
  """
  def cooked_recipes(order_id) do
    query =
      from(
        p in PlannedRecipe,
        where: p.line_id == ^order_id and p.cooked == true,
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
      Supermarket.apply_changes(changes)

      current()
    else
      _ -> current()
    end
  end

  def start_shopping(order_id) do
    new_order_id = Integer.to_string(:os.system_time(:micro_seconds))
    finish_order(order_id, new_order_id)

    last()
  end

  def stop_shopping(_order_id) do
    order_id = last_order_id()
    {:ok, cart} = cart(order_id)
    items = Map.values(cart)

    with {:ok, bought} <- Shopping.ingredients_bought?(order_id, Enum.map(items, & &1.ingredient.id)),
         not_bought <- Enum.reject(items, &bought[&1.ingredient.id]),
         _now_bought <- Enum.map(not_bought, &Shopping.buy_ingredient(order_id, &1.ingredient.id)),
         _ordered <- Enum.map(not_bought, &order_ingredient("1", &1.ingredient.id, &1.quantity)) do
      last()
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
      {:ok, _planned_recipe} -> sync_supermarket(order_id)
      err -> err
    end
  end

  @doc """
  Ingredients bought in an earlier order, most recently bought first.

  `order_id` is the live cart, so what sits on it now is not history yet.
  Every other line id is an order `finish_order/2` archived, including the
  supermarket's own order numbers from before it minted its own ids, so all of
  them count as bought. Ordering on when each ingredient was last bought
  leaves those old ones at the bottom without a rule that names them.
  """
  def previously_ordered_ingredients(order_id) do
    query =
      from(
        m in ManualIngredient,
        join: i in assoc(m, :ingredient),
        where: m.line_id != ^order_id,
        group_by: i.id,
        order_by: [desc: max(m.inserted_at)],
        select: i
      )

    {:ok, Repo.all(query)}
  end

  @doc """
  How often each recipe was planned and when it was planned last, most recently
  planned first.

  Only orders `finish_order/2` archived count, the same way
  `previously_ordered_ingredients/1` counts them: `order_id` is the live cart,
  so a recipe on it now is a plan, not a meal. A recipe that was unplanned again
  never became one either. Recipes nobody ever planned still come back, last,
  with a count of zero and no date, because those are the ones a planner wants
  to see.
  """
  def recipe_history(order_id, limit) do
    query =
      from(
        r in Recipe.Recipe,
        left_join: p in PlannedRecipe,
        on: p.recipe_id == r.id and p.line_id != ^order_id and p.unplanned == false,
        group_by: r.id,
        order_by: [desc_nulls_last: max(p.inserted_at)],
        limit: ^limit,
        select: %{
          recipe_id: r.id,
          title: r.title,
          times_planned: count(p.id),
          last_planned_at: max(p.inserted_at)
        }
      )

    {:ok, Repo.all(query)}
  end

  @doc """
  How often each ingredient was bought, when it was bought last, and the mean
  number of days between two buys. Most bought over the last year first.

  A row with quantity 0 is an ingredient taken off the list again, so it is not
  a buy. `times_bought_last_year` is what separates an ingredient that is due
  from one that was dropped: both are long past their gap, only the dropped one
  has stopped appearing.
  """
  def ingredient_history(order_id, limit) do
    year_ago = NaiveDateTime.add(NaiveDateTime.utc_now(), -365, :day)

    buys =
      from(
        m in ManualIngredient,
        where: m.line_id != ^order_id and m.quantity > 0,
        select: %{
          ingredient_id: m.ingredient_id,
          inserted_at: m.inserted_at,
          gap_days:
            fragment(
              "cast(extract(epoch from ? - lag(?) over (partition by ? order by ?)) / 86400 as float)",
              m.inserted_at,
              m.inserted_at,
              m.ingredient_id,
              m.inserted_at
            )
        }
      )

    query =
      from(
        b in subquery(buys),
        join: i in Recipe.Ingredient,
        on: i.id == b.ingredient_id,
        group_by: i.id,
        order_by: [desc: selected_as(:times_bought_last_year), desc: selected_as(:times_bought)],
        limit: ^limit,
        select: %{
          ingredient_id: i.id,
          name: i.name,
          times_bought: selected_as(count(b.ingredient_id), :times_bought),
          times_bought_last_year:
            selected_as(
              fragment("count(*) filter (where ? > ?)", b.inserted_at, ^year_ago),
              :times_bought_last_year
            ),
          last_bought_at: max(b.inserted_at),
          average_gap_days: avg(b.gap_days)
        }
      )

    {:ok, Repo.all(query)}
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
    with {:ok, planned_recipe_ids} <- planned_recipes(order_id) do
      Recipe.recipes_by_ingredient_ids(ingredient_ids, planned_recipe_ids)
    end
  end

  def last_order_id() do
    max(
      Repo.one(
        from(
          p in PlannedRecipe,
          where: fragment("? ~ ?", p.line_id, "^([0-9]+[.]?[0-9]*|[.][0-9]+)$"),
          select: max(p.line_id)
        )
      ),
      Repo.one(
        from(
          p in ManualIngredient,
          where: fragment("? ~ ?", p.line_id, "^([0-9]+[.]?[0-9]*|[.][0-9]+)$"),
          select: max(p.line_id)
        )
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

  defp recipe_ingredient_quantities(order_id) do
    query =
      from(
        p in PlannedRecipe,
        where: p.line_id == ^order_id,
        select: {p.recipe_id, fragment("? * Cast(NOT ? as integer)", p.quantity, p.unplanned)}
      )

    {:ok, Enum.into(Repo.all(query), %{})}
  end

  defp ordered_item_quantities(_order_id) do
    {:ok, order} = current()

    existing =
      Enum.reduce(order.items, %{}, fn item, acc ->
        Map.update(acc, item.id, item.quantity, &(&1 + 2))
      end)

    {:ok, existing}
  end
end
