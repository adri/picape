defmodule Picape.Supermarket.Login do
  @moduledoc """
  Represents a login to a supermarket
  """
  use Ecto.Schema
  import Ecto.Changeset

  @safety_margin_seconds 5 * 60

  schema "supermarket_login" do
    field(:access_token, :string)
    field(:refresh_token, :string)
    field(:expires_in, :integer, default: 0)

    timestamps()
  end

  @doc false
  def edit_changeset(%__MODULE__{} = login, attrs) do
    login
    |> cast(attrs, [:access_token, :refresh_token, :expires_in])
    |> validate_required([:access_token, :refresh_token])
  end

  def is_expired(%__MODULE__{} = login) do
    expires_in = login.expires_in || 0

    expires_at =
      login.updated_at
      |> NaiveDateTime.add(expires_in - @safety_margin_seconds, :second)

    NaiveDateTime.compare(NaiveDateTime.utc_now(), expires_at) == :gt
  end
end
