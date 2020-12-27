defmodule Picape.Order.Sync do
  alias Picape.Order.{Product}

  defmodule(Changes, do: defstruct(add: [], modify: [], remove: []))

  def changes(planned, manual, existing) do
    with {:ok} <- validate(planned),
         {:ok} <- validate(manual),
         {:ok} <- validate(existing) do
      planned
      |> overwrite(manual)
      |> find_changes(existing)
    end
  end

  # ---

  defp validate(map) do
    case Enum.all?(Map.values(map), &(&1 >= 0)) do
      true -> {:ok}
      false -> {:error, :negative_quantity}
    end
  end

  defp overwrite(a, b) do
    Map.merge(a, b, fn _id, _quantity1, quantity2 -> quantity2 end)
  end

  defp find_changes(new, existing) do
    ids = Enum.uniq(Map.keys(new) ++ Map.keys(existing))

    changes =
      Enum.reduce(ids, struct(Changes), fn id, changes ->
        changes
        |> changes_for_id(id, new[id], existing[id])
      end)

    case changes do
      %Changes{add: [], modify: [], remove: []} -> {:error, :no_changes}
      changes -> {:ok, changes}
    end
  end

  defp changes_for_id(changes, id, new_count, existing_count) do
    cond do
      # Don't remove if it doesn't exist
      new_count == 0 && existing_count == nil ->
        changes

      # Leave supermarket product untouched
      new_count == nil ->
        changes

      existing_count == nil ->
        add_change(changes, id, new_count)

      new_count == existing_count ->
        changes

      new_count == 0 && existing_count != nil ->
        remove_change(changes, id)

      new_count != existing_count ->
        modify_change(changes, id, new_count)
    end
  end

  defp add_change(changes, id, quantity) do
    %{changes | add: [%Product{id: id, quantity: quantity} | changes.add]}
  end

  defp modify_change(changes, id, quantity) do
    %{changes | modify: [%Product{id: id, quantity: quantity} | changes.modify]}
  end

  defp remove_change(changes, id) do
    %{changes | remove: [%Product{id: id, quantity: 0} | changes.remove]}
  end
end
