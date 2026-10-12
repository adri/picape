defmodule Picape.Settings.Setting do
  use Ecto.Schema
  import Ecto.Changeset
  alias Picape.Settings.Setting

  schema "setting" do
    field(:key, :string)
    field(:value, :string)

    timestamps()
  end

  @doc false
  def changeset(%Setting{} = setting, attrs) do
    setting
    |> cast(attrs, [:key, :value])
    |> validate_required([:key, :value])
  end
end
