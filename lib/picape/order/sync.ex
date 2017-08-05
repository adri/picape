defmodule Picape.Order.Sync do

  alias Picape.Order.{Product}

  defmodule Changes, do: defstruct add: [], remove: []

  def changes(planned, manual, existing) do
    with {:ok} <- validate(planned),
         {:ok} <- validate(manual),
         {:ok} <- validate(existing)
    do
      planned
      |> merge(manual)
      |> find_changes(existing)
    else
      err -> {:error, err}
    end
  end

  # ---

  defp validate(map) do
    case Enum.all?(Map.values(map), &(&1 >= 0)) do
      true -> {:ok}
      false -> :negative_quantity
    end
  end

  defp merge(a, b) do
    Map.merge(a, b, fn _id, v1, v2 -> v1 + v2 end)
  end

  defp find_changes(new, existing) do
    ids = Enum.uniq(Map.keys(new) ++ Map.keys(existing))
    changes = Enum.reduce(ids, struct(Changes), fn(id, changes) ->
      changes
      |> changes_for_id(id, new[id], existing[id])
    end)

    {:ok, changes}
  end

  defp changes_for_id(changes, id, new_count, existing_count) do
    cond do
      new_count == 0 && existing_count == nil -> changes # Don't remove if it doesn't exist
      new_count == nil            -> changes # Leave supermarket product untouched
      existing_count == nil       -> add_change(changes, id, new_count)
      new_count == existing_count -> changes
      new_count > existing_count  -> add_change(changes, id, new_count - existing_count)
      new_count < existing_count  -> remove_change(changes, id, existing_count - new_count)
    end
  end

  defp add_change(changes, id, quantity) do
    %{changes | add: [%Product{id: id, quantity: quantity} | changes.add]}
  end

  defp remove_change(changes, id, quantity) do
    %{changes | remove: [%Product{id: id, quantity: quantity} | changes.remove]}
  end
end
