defmodule Picape.Order do
  import Ecto.Query
  require Logger

  alias Picape.Order.{
    Line,
    Item,
    LineFromSupermarket,
    LineFromPicnic,
    LineFromDb,
    PlannedRecipe,
    ManualIngredient,
    PlacedOrder,
    Sync
  }

  alias Picape.{Repo, Supermarket, Picnic, Recipe, Shopping, Ingredients, Settings, Checklist}

  defmodule(Product, do: defstruct([:id, :quantity]))

  @doc """
  Returns the currently active cart. In checklist mode that is the list Picape
  computed, with the ticked-off state overlaid — no supermarket call happens.
  In picnic mode it is the Picnic cart plus the planned items that have no
  Picnic mapping, which stay on the checklist. An `ah` or `picnic` order whose
  supermarket does not answer is served the same way, flagged
  `supermarket_reachable: false`, so a dead API does not take the list down
  with it.
  """
  def current() do
    cond do
      Settings.checklist?() ->
        {:ok, cart} = cart("1")
        {:ok, checklist_line(LineFromDb.convert(cart))}

      Settings.picnic?() ->
        try do
          {:ok, picnic_line(Picnic.cart())}
        rescue
          error -> fallback_line(error)
        end

      true ->
        try do
          line = LineFromSupermarket.convert(Supermarket.cart())
          {:ok, %{line | is_placed: order_placed?(), supermarket_reachable: true}}
        rescue
          error -> fallback_line(error)
        end
    end
  end

  def last() do
    {:ok, cart} = cart(last_order_id())
    {:ok, LineFromDb.convert(cart, last_order_id())}
  end

  @doc """
  Every closed order, most recently closed first.

  Orders archived after snapshots were added return the basket contents as the
  supermarket reported them, so products added in the supermarket's own app
  appear too — they show up as items with no `ingredient`. Older orders fall
  back to what Picape tracked in its plan and manual rows.
  """
  def previous_orders() do
    snapshot_ids = Repo.all(from(i in Item, select: i.line_id, distinct: true))

    plan_ids =
      Repo.all(from(p in PlannedRecipe, select: p.line_id, distinct: true)) ++
        Repo.all(from(m in ManualIngredient, select: m.line_id, distinct: true))

    (snapshot_ids ++ plan_ids)
    |> Enum.uniq()
    |> Enum.reject(&(&1 == "1"))
    |> Enum.map(&{&1, closed_at(&1)})
    |> Enum.sort_by(&elem(&1, 1), {:desc, NaiveDateTime})
    |> Enum.map(fn {order_id, closed_at} ->
      %{previous_order(order_id) | closed_at: closed_at}
    end)
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
        for {id, quantity} <- merged,
            ingredient = ingredients[id],
            not is_nil(ingredient),
            into: %{} do
          {id,
           %{
             id: id,
             ingredient: ingredient,
             quantity: quantity
           }}
        end

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

  While the supermarket is processing a paid order the basket answers for the
  next order, so Picape freezes instead of pushing its plan into it: it writes
  nothing and archives the plan that produced the paid order exactly once.
  After delivery the freeze lifts and whatever accumulated on `order_id` is
  the new order.
  """
  def sync_supermarket(order_id) do
    ensure_order_is_current(order_id)

    cond do
      Settings.checklist?() ->
        current()

      Settings.picnic?() ->
        sync_picnic(order_id)

      order_placed?() ->
        archive_placed_order(order_id)
        current()

      true ->
        with {:ok, recipe_quantities} <- recipe_ingredient_quantities(order_id),
             {:ok, planned} <- Recipe.item_quantities(recipe_quantities),
             {:ok, manual} <- manual_ingredients(order_id),
             {:ok, line} <- current(),
             {:ok, existing} <- ordered_item_quantities(line),
             {:ok, changes} <-
               Sync.changes(substitute(planned, line), substitute(manual, line), existing) do
          push(changes, line)
          current()
        else
          _ -> current()
        end
    end
  end

  @doc """
  Switches where the current order lives: the supermarket basket ("ah"), the
  Picnic cart ("picnic") or Picape's own checklist ("checklist"). Switching to
  "ah" or "picnic" pushes the list that accumulated while the supermarket was
  away into that basket; a supermarket that is still unreachable does not
  block the switch, the next sync retries.
  """
  def set_mode(mode) when mode in ["ah", "checklist", "picnic"] do
    previous = Settings.mode()
    {:ok, _} = Settings.set("mode", mode)

    if mode != previous and mode in ["ah", "picnic"] do
      try do
        {:ok, line} = sync_supermarket("1")

        if line.supermarket_reachable == false do
          {:ok, %{mode: mode, pushed_to_supermarket: false, error: "the supermarket is unreachable"}}
        else
          {:ok, %{mode: mode, pushed_to_supermarket: true}}
        end
      rescue
        error ->
          {:ok, %{mode: mode, pushed_to_supermarket: false, error: Exception.message(error)}}
      end
    else
      {:ok, %{mode: mode}}
    end
  end

  def set_mode(mode), do: {:error, "unknown mode #{inspect(mode)}"}

  def start_shopping(order_id) do
    new_order_id = Integer.to_string(:os.system_time(:micro_seconds))
    finish_order(order_id, new_order_id)
    snapshot_order(new_order_id, supermarket_items())

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

  def ingredients_ordered_quantity(_order_id, ingredient_ids) do
    with {:ok, line} <- current(),
         {:ok, items} <- ordered_item_quantities(line),
         {:ok, items_map} <- item_ingredient_ids(Map.keys(items)) do
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

  @doc """
  The products in the cart that stand in for a wanted-but-unavailable
  ingredient: `%{replacement product id => original ingredient}`. A product
  nobody mapped to an ingredient can never be a stand-in.
  """
  def substitutions(order_id) do
    {:ok, line} = current()
    {:ok, recipe_quantities} = recipe_ingredient_quantities(order_id)
    {:ok, planned} = Recipe.item_quantities(recipe_quantities)
    {:ok, manual} = manual_ingredients(order_id)
    wanted = Map.merge(planned, manual, fn _id, _q1, q2 -> q2 end)

    {:ok, wanted_ingredients} = Recipe.ingredients_by_item_ids(Map.keys(wanted))
    unavailable = unavailable_product_ids(line, wanted_ingredients)
    in_cart = MapSet.new(Enum.map(line.items, & &1.id))

    for {product_id, ingredient} <- wanted_ingredients,
        MapSet.member?(unavailable, product_id),
        %{replacement_ingredient_id: rid} when not is_nil(rid) <- [ingredient],
        {:ok, %{^rid => replacement}} <- [Ingredients.ingredients_by_ids([rid])],
        MapSet.member?(in_cart, replacement.supermarket_product_id),
        into: %{} do
      {replacement.supermarket_product_id, ingredient}
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

  # The Picnic cart plus the planned ingredients that have no Picnic mapping,
  # which fall back to the checklist. Products added in the Picnic app itself
  # carry no ingredient, like the supermarket's external items.
  defp picnic_line(cart) do
    line = LineFromPicnic.convert(cart)
    {:ok, by_product} = Ingredients.by_picnic_product_ids(Enum.map(line.items, & &1.id))
    {:ok, db_cart} = cart("1")
    checked = Checklist.checked_ids()

    unmapped =
      db_cart
      |> Map.values()
      |> Enum.filter(&is_nil(&1.ingredient.picnic_product_id))
      |> Enum.map(&LineFromDb.convert_item/1)

    items =
      Enum.map(line.items, fn item ->
        %{item | ingredient_id: get_in(by_product, [item.id, Access.key(:id)])}
      end)

    items = Enum.map(items ++ unmapped, &%{&1 | checked: MapSet.member?(checked, &1.ingredient_id)})

    %{
      line
      | items: items,
        total_count: line.total_count + length(unmapped),
        supermarket_reachable: true
    }
  end

  # Pushes what the plan wants into the Picnic cart. Only the Picnic cart rows
  # (`store == "picnic"`) count as existing; checklist items and products the
  # Picnic app added itself are left alone — the diff only names mapped ids.
  defp sync_picnic(order_id) do
    try do
      {:ok, wanted} = planned_picnic_quantities(order_id)
      {:ok, manual} = manual_ingredient_quantities(order_id)
      {:ok, manual_by_id} = Ingredients.ingredients_by_ids(Map.keys(manual))
      # The cached cart can be five hours old; the diff is only as correct as
      # the cart it is computed against, so sync reads a fresh one.
      Picnic.invalidate_cart()
      {:ok, line} = current()

      # A manual row wins over the plan, including quantity 0: it takes the
      # product out of the Picnic cart the same way it empties the AH basket.
      manual =
        for {ingredient_id, quantity} <- manual,
            ingredient = manual_by_id[ingredient_id],
            not is_nil(ingredient) and not is_nil(ingredient.picnic_product_id),
            into: %{},
            do: {ingredient.picnic_product_id, quantity}

      existing = picnic_quantities(line)

      with {:ok, changes} <- Sync.changes(wanted, manual, existing) do
        push_picnic(changes, existing, line)
      end
    rescue
      error -> Logger.warning("syncing the Picnic cart failed: #{Exception.message(error)}")
    end

    current()
  end

  # What the plan wants in the Picnic cart, keyed by selling unit id. Keyed on
  # the ingredient, not the AH product id, so a picnic-only ingredient syncs too.
  # Unplanned recipes come back at quantity 0, the same way
  # recipe_ingredient_quantities/1 works: a sync after an unplan then removes
  # the products instead of leaving them in the cart.
  defp planned_picnic_quantities(order_id) do
    query =
      from(
        p in PlannedRecipe,
        join: r in Recipe.IngredientRef,
        on: r.recipe_id == p.recipe_id,
        join: i in assoc(r, :ingredient),
        where:
          p.line_id == ^order_id and i.is_essential == false and
            not is_nil(i.picnic_product_id),
        select: {i.picnic_product_id, fragment("? * ? * Cast(NOT ? as integer)", p.quantity, r.quantity, p.unplanned)}
      )

    wanted =
      query
      |> Repo.all()
      |> Enum.reduce(%{}, fn {product_id, quantity}, acc ->
        Map.update(acc, product_id, quantity, &(&1 + quantity))
      end)

    {:ok, wanted}
  end

  defp manual_ingredient_quantities(order_id) do
    query =
      from(
        m in ManualIngredient,
        where: m.line_id == ^order_id,
        select: {m.ingredient_id, m.quantity}
      )

    {:ok, Enum.into(Repo.all(query), %{})}
  end

  # The cart can carry the same selling unit on two ORDER_LINE groups, so
  # quantities sum per product id instead of the later row overwriting the
  # earlier one.
  defp picnic_quantities(line) do
    Enum.reduce(line.items, %{}, fn
      %{store: "picnic"} = item, acc ->
        Map.update(acc, item.id, item.quantity, &(&1 + item.quantity))

      _item, acc ->
        acc
    end)
  end

  # A line served from the fallback produced no changes to push, and a dead
  # Picnic answers none. The plan rows are already written, so the next sync
  # that reaches Picnic pushes them.
  defp push_picnic(_changes, _existing, %{supermarket_reachable: false}), do: :ok

  defp push_picnic(changes, existing, _line) do
    Picnic.apply_changes(changes, existing)
  rescue
    error -> Logger.warning("pushing the list to Picnic failed: #{Exception.message(error)}")
  end

  # The cart rows carry different keys per mode: a supermarket product id in
  # ah, a Picnic selling unit id for cart rows in picnic, and a supermarket
  # product id again for the checklist rows picnic mode falls back to. Returns
  # `ingredient_id => item id`.
  defp item_ingredient_ids(item_ids) do
    if Settings.picnic?() do
      {:ok, by_item} = Recipe.ingredients_by_item_ids_reverse(Enum.filter(item_ids, &is_integer/1))
      {:ok, by_product} = Ingredients.by_picnic_product_ids(item_ids)

      items_map =
        Map.merge(
          by_item,
          Map.new(by_product, fn {product_id, ingredient} -> {ingredient.id, product_id} end)
        )

      {:ok, items_map}
    else
      Recipe.ingredients_by_item_ids_reverse(item_ids)
    end
  end

  defp checklist_line(line) do
    checked = Checklist.checked_ids()

    %{line | items: Enum.map(line.items, &%{&1 | checked: MapSet.member?(checked, &1.ingredient_id)})}
  end

  # The computed list stands in for a basket the supermarket will not answer.
  # It is flagged so the caller can say where the list came from.
  defp fallback_line(error) do
    Logger.warning("serving the checklist, the supermarket is unreachable: #{Exception.message(error)}")

    {:ok, cart} = cart("1")
    {:ok, checklist_line(%{LineFromDb.convert(cart) | supermarket_reachable: false})}
  end

  # A line served from the fallback produced no changes to push, and a dead
  # supermarket answers none. The plan rows are already written, so the next
  # sync that reaches the supermarket pushes them.
  defp push(_changes, %{supermarket_reachable: false}), do: :ok

  defp push(changes, _line) do
    Supermarket.apply_changes(changes)
  rescue
    error -> Logger.warning("pushing the list to the supermarket failed: #{Exception.message(error)}")
  end

  # The moment an order closed, as the newest row it left behind. `nil` means
  # only plan rows exist; they sort below any snapshotted order.
  defp closed_at(order_id) do
    [
      Repo.one(from(i in Item, where: i.line_id == ^order_id, select: max(i.inserted_at))),
      Repo.one(from(p in PlannedRecipe, where: p.line_id == ^order_id, select: max(p.inserted_at))),
      Repo.one(from(m in ManualIngredient, where: m.line_id == ^order_id, select: max(m.inserted_at)))
    ]
    |> Enum.reject(&is_nil/1)
    |> Enum.max(NaiveDateTime, fn -> ~N[1970-01-01 00:00:00] end)
  end

  defp previous_order(order_id) do
    case Repo.all(from(i in Item, where: i.line_id == ^order_id, order_by: i.name)) do
      [] ->
        {:ok, cart} = cart(order_id)
        LineFromDb.convert(cart, order_id)

      rows ->
        %Line{
          id: order_id,
          items: Enum.map(rows, fn %Item{} = row -> %Item{row | id: row.product_id} end),
          total_count: length(rows),
          total_price: 0,
          total_discount: 0
        }
    end
  end

  defp ensure_order_is_current(order_id) do
    with latest_order_id when not is_nil(latest_order_id) <- last_order_id(),
         false <- planned_items_in_order?(latest_order_id) do
      finish_order(order_id, latest_order_id)
    end
  end

  defp finish_order(order_id, latest_order_id) do
    from(p in PlannedRecipe, where: p.line_id == ^order_id)
    |> Repo.update_all(set: [line_id: latest_order_id])

    from(i in ManualIngredient, where: i.line_id == ^order_id)
    |> Repo.update_all(set: [line_id: latest_order_id])

    Checklist.clear()
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

  defp ordered_item_quantities(line) do
    {:ok,
     Enum.reduce(line.items, %{}, fn item, acc ->
       Map.update(acc, item.id, item.quantity, &(&1 + 2))
     end)}
  end

  defp order_placed?() do
    Supermarket.placed_order_id() != nil
  rescue
    # The order summaries share the supermarket's fate: unreachable means not
    # placed, so Picape keeps working instead of freezing on a guess.
    _ -> false
  end

  # The supermarket's order number names the archived line, the same way the
  # order numbers from before Picape minted its own ids do. Archiving is
  # once-only and the marker lives in `order_placed`: a `order_id` seen before
  # means the freeze is not new, and rows planned on `order_id` since then
  # belong to the next order.
  defp archive_placed_order(order_id) do
    placed_id = to_string(Supermarket.placed_order_id())

    unless Repo.exists?(from(p in PlacedOrder, where: p.order_id == ^placed_id)) do
      Repo.insert!(%PlacedOrder{order_id: placed_id})
      snapshot_order(placed_id, get_in(Supermarket.cart(), ["basket", "itemsInOrder"]) || [])

      if planned_items_in_order?(order_id) do
        finish_order(order_id, placed_id)
      end
    end
  end

  # In checklist mode or with the supermarket down there is no basket to
  # snapshot; the plan rows alone record the order then, like before snapshots.
  # A picnic order keeps its plan rows too: `order_item.product_id` is numeric
  # and Picnic's selling unit ids are strings, so they cannot be stored yet.
  defp supermarket_items() do
    if Settings.picnic?() do
      []
    else
      Supermarket.cart()["items"] || []
    end
  rescue
    _ -> []
  end

  # Stores the basket contents as the order's permanent record: what was really
  # ordered, including products added in the supermarket's own app that Picape
  # never knew. Such items keep nil `ingredient_id`, which marks them external.
  defp snapshot_order(_order_id, []), do: :ok

  defp snapshot_order(order_id, items) do
    product_ids = Enum.map(items, & &1["product"]["id"])
    {:ok, by_product} = Recipe.ingredients_by_item_ids(product_ids)
    now = NaiveDateTime.truncate(NaiveDateTime.utc_now(), :second)

    rows =
      Enum.map(items, fn %{"product" => product} = item ->
        %{
          line_id: order_id,
          product_id: product["id"],
          name: product["title"],
          image_url: Supermarket.image_url(product),
          quantity: item["quantity"],
          ingredient_id:
            case by_product[product["id"]] do
              nil -> nil
              ingredient -> ingredient.id
            end,
          recipe_ids: [],
          inserted_at: now,
          updated_at: now
        }
      end)

    Repo.insert_all(Item, rows)
  end

  # A product the supermarket cannot deliver is swapped for the product behind
  # the ingredient's replacement, when it names one. The cart then holds the
  # replacement and the row flags it as `substituted_for`.
  defp substitute(quantities, line) do
    {:ok, by_product} = Recipe.ingredients_by_item_ids(Map.keys(quantities))
    unavailable = unavailable_product_ids(line, by_product)

    Enum.reduce(quantities, %{}, fn {product_id, quantity}, acc ->
      product_id = substitute_product_id(product_id, unavailable, by_product[product_id])
      Map.update(acc, product_id, quantity, &(&1 + quantity))
    end)
  end

  defp substitute_product_id(product_id, unavailable, %{
         replacement_ingredient_id: replacement_id
       })
       when not is_nil(replacement_id) do
    if MapSet.member?(unavailable, product_id) do
      case Ingredients.ingredients_by_ids([replacement_id]) do
        {:ok, %{^replacement_id => %{supermarket_product_id: id}}} when not is_nil(id) -> id
        _ -> product_id
      end
    else
      product_id
    end
  end

  defp substitute_product_id(product_id, _unavailable, _ingredient), do: product_id

  # Live basket availability covers what is in the cart; the productCard the
  # nightly matcher stores covers what is only planned. A product nobody
  # mapped to an ingredient can only be judged by the live read.
  defp unavailable_product_ids(line, by_product) do
    from_cart = for item <- line.items, not item.is_orderable, do: item.id

    from_card =
      for {product_id, ingredient} <- by_product,
          match?({:ok, _}, Recipe.Ingredient.fetch(ingredient, :warning)),
          do: product_id

    MapSet.new(from_cart ++ from_card)
  end
end
