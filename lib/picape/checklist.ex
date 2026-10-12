defmodule Picape.Checklist do
  @moduledoc """
  The self-managed shopping list Picape uses while the supermarket is
  unreachable: `Settings.mode()` `"checklist"`. The list itself is the same
  computed cart `Order.cart/1` builds from planned recipes and manual
  ingredients — this context only stores which of its items are ticked off.
  Closing an order clears the ticks; the plan rows carry over unchanged.
  """

  import Ecto.Query

  alias Picape.{Repo, Settings}
  alias Picape.Checklist.Item

  @doc """
  Ticks an ingredient on the checklist (`checked` true) or unticks it.
  Only writes in checklist mode: ticking a basket the supermarket owns would
  record a state nothing reads.
  """
  def check(ingredient_id, checked \\ true) do
    if Settings.checklist?() do
      %Item{}
      |> Item.changeset(%{ingredient_id: ingredient_id, checked: checked})
      |> Repo.insert(
        on_conflict: [set: [checked: checked]],
        conflict_target: :ingredient_id
      )
    else
      {:error, "Picape is not in checklist mode"}
    end
  end

  @doc "The ingredient ids ticked off on the current checklist."
  def checked_ids() do
    from(i in Item, where: i.checked == true, select: i.ingredient_id)
    |> Repo.all()
    |> MapSet.new()
  end

  @doc "Drops every tick. Called when the order they belonged to closes."
  def clear(), do: Repo.delete_all(Item)
end
