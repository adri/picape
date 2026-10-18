defmodule Picape.Settings do
  @moduledoc """
  Key-value settings that live in the database so they can change at runtime.
  Currently holds only `mode`: `"ah"` syncs the plan into the supermarket
  basket, `"picnic"` syncs it into the Picnic cart, and `"checklist"` keeps it
  as Picape's own shopping list instead.
  """

  alias Picape.Repo
  alias Picape.Settings.Setting

  def get(key) do
    case Repo.get_by(Setting, key: key) do
      nil -> nil
      setting -> setting.value
    end
  end

  def set(key, value) do
    %Setting{}
    |> Setting.changeset(%{key: key, value: value})
    |> Repo.insert(on_conflict: [set: [value: value]], conflict_target: :key)
  end

  @doc "The current shopping mode: ah or picnic sync into that store's basket, checklist keeps the list in Picape."
  def mode(), do: get("mode") || "ah"

  def checklist?(), do: mode() == "checklist"

  def picnic?(), do: mode() == "picnic"
end
