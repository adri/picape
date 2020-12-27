defmodule Picape.Supermarket.Login do
  @moduledoc """
  Represents a login to a supermarket
  """
  use Ecto.Schema
  import Ecto.Changeset

  schema "supermarket_login" do
    field(:access_token, :string)
    field(:refresh_token, :string)

    timestamps()
  end

  @doc false
  def edit_changeset(%__MODULE__{} = login, attrs) do
    login
    |> cast(attrs, [:access_token, :refresh_token])
    |> validate_required([:access_token, :refresh_token])
  end

  def is_expired(%__MODULE__{} = login) do
    :gt ==
      NaiveDateTime.utc_now()
      |> NaiveDateTime.add(-90 * 60, :second)
      |> NaiveDateTime.compare(login.updated_at)
  end
end
