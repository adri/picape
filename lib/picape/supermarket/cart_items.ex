defmodule Picape.Supermarket.CartItems do
  @moduledoc """
  Translates an `Order.Sync.Changes` struct into the `BasketMutation`
  variables that AH's `UpdateMyListBasket` GraphQL mutation expects.

  Each emitted item is a map with `id`, `quantity`, `isStrikethrough`,
  `newPosition` — sent verbatim like the iOS app does. `quantity: 0`
  removes; `quantity >= 1` adds (when id is new) or updates.
  """

  def apply_changes(changes, cart) do
    positions = positions_by_id(cart)
    next_position = (positions |> Map.values() |> Enum.max(fn -> 0 end)) + 1

    {removes, _} =
      changes.remove
      |> Enum.map_reduce(next_position, fn change, pos ->
        position = Map.get(positions, change.id, pos)
        {to_basket_mutation(change.id, 0, position), pos}
      end)

    {adds, _} =
      changes.add
      |> Enum.map_reduce(next_position, fn change, pos ->
        case Map.get(positions, change.id) do
          nil -> {to_basket_mutation(change.id, change.quantity, pos), pos + 1}
          existing -> {to_basket_mutation(change.id, change.quantity, existing), pos}
        end
      end)

    removes ++ adds
  end

  defp to_basket_mutation(id, quantity, position) do
    %{
      "id" => id,
      "quantity" => quantity,
      "isStrikethrough" => false,
      "newPosition" => position
    }
  end

  defp positions_by_id(%{"basket" => basket}) when is_map(basket) do
    [
      basket["itemsInOrder"] || [],
      basket["itemsInList"] || [],
      basket["externalItems"] || []
    ]
    |> List.flatten()
    |> Enum.into(%{}, fn item -> {item["product"]["id"], item["position"]} end)
  end

  defp positions_by_id(_), do: %{}
end
