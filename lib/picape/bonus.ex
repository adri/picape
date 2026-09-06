defmodule Picape.Bonus do
  @moduledoc """
  The supermarket's personal bonus offers: a set you are given for one week, of
  which you may activate a limited number.

  A flat list of offers is worth little, so every offer is matched against the
  ingredients Picape already knows. The products behind an offer carry the same
  ids as `Ingredient.supermarket_product_id`, so the offers that touch what you
  actually buy can be told apart from the rest, and are listed first.
  """

  alias Picape.{Ingredients, Order, Supermarket}

  # Fifteen offers means fifteen calls for the products behind them. They are
  # cached per period, so this only binds on the first read of a new week.
  @concurrency 5
  @timeout :timer.seconds(20)

  @doc "Every personal offer for the period the current order is delivered in."
  def offers do
    {period_start, period_end} = period()
    data = Supermarket.bonus_offers(period_start, period_end)
    promotions = data["bonusPromotions"] || []

    product_ids = product_ids(promotions, period_start, period_end)
    ingredients = product_ids |> Map.values() |> List.flatten() |> Ingredients.by_supermarket_product_ids()

    offers =
      Enum.map(promotions, fn promotion ->
        offer(promotion, Map.get(product_ids, promotion["id"], []), ingredients)
      end)

    %{
      maximum_activations: get_in(data, ["bonusPersonalPromotionBundles", Access.at(0), "maximumActivations"]),
      activated_count: Enum.count(offers, & &1.is_activated),
      offers: Enum.sort_by(offers, &(&1.ingredients == []))
    }
  end

  @doc """
  Activates one offer on the loyalty account. This is a real write that spends
  one of the period's activations, and it cannot be undone.
  """
  def activate(offer_id) do
    %{offers: offers, maximum_activations: maximum, activated_count: activated} = offers()

    with :ok <- check_room(activated, maximum),
         {:ok, offer} <- fetch_offer(offers, offer_id),
         {:ok, :activated} <- Supermarket.activate_bonus_offer(offer.hq_id, offer.period_start) do
      invalidate()
      {:ok, offers()}
    end
  end

  @doc "Drops the cached offers, so the next read sees what was activated since."
  def invalidate do
    {period_start, _period_end} = period()
    Supermarket.invalidate_bonus_offers(period_start)
  end

  defp check_room(activated, maximum) when is_integer(maximum) and activated >= maximum do
    {:error, "all #{maximum} activations for this period are used"}
  end

  defp check_room(_activated, _maximum), do: :ok

  defp fetch_offer(offers, offer_id) do
    case Enum.find(offers, &(&1.id == offer_id)) do
      nil -> {:error, "no bonus offer with id #{inspect(offer_id)}"}
      %{is_activated: true} -> {:error, "bonus offer #{offer_id} is already activated"}
      offer -> {:ok, offer}
    end
  end

  defp product_ids(promotions, period_start, period_end) do
    promotions
    |> Task.async_stream(
      fn promotion ->
        {promotion["id"], Supermarket.bonus_offer_product_ids(promotion["id"], period_start, period_end)}
      end,
      max_concurrency: @concurrency,
      timeout: @timeout,
      on_timeout: :kill_task
    )
    # One offer the supermarket will not answer for costs that offer its match,
    # rather than the whole screen.
    |> Enum.flat_map(fn
      {:ok, pair} -> [pair]
      {:exit, _reason} -> []
    end)
    |> Map.new()
  end

  defp offer(promotion, product_ids, ingredients) do
    %{
      id: promotion["id"],
      hq_id: promotion["hqId"],
      title: promotion["title"],
      subtitle: promotion["subtitle"],
      category: promotion["category"],
      discount: get_in(promotion, ["rawPromotionLabels", Access.at(0), "defaultDescription"]),
      image_url: image_url(promotion["images"] || []),
      product_count: promotion["productCount"],
      period_start: promotion["periodStart"],
      is_activated: promotion["activationStatus"] == "ACTIVATED",
      ingredients: Enum.flat_map(product_ids, &List.wrap(ingredients[&1]))
    }
  end

  # An offer's picture comes at 200, 400 and 800 pixels square, all of them
  # larger than the row it lands on wants.
  defp image_url([]), do: nil
  defp image_url(images), do: images |> Enum.min_by(& &1["width"]) |> Map.get("url")

  # The offers worth showing are the ones running when the order arrives, which
  # is the period the supermarket's own app asks for. A week runs Monday to
  # Sunday.
  defp period do
    monday = Date.beginning_of_week(delivery_date())
    {Date.to_iso8601(monday), Date.to_iso8601(Date.add(monday, 6))}
  end

  defp delivery_date do
    case Order.current() do
      {:ok, %{delivery_date: date}} when is_binary(date) -> Date.from_iso8601!(date)
      _ -> Date.utc_today()
    end
  end
end
