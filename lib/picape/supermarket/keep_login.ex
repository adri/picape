defmodule Picape.Supermarket.KeepLogin do
  @moduledoc """
  Uses a refresh token to keep a login (valid token) to the
  supermarket.
  """
  alias Picape.Repo
  alias Picape.Supermarket
  alias Picape.Supermarket.Login

  def get_access_token() do
    login = Repo.one(Login)

    case Login.is_expired(login) do
      true ->
        renew_login(login).access_token

      false ->
        login.access_token
    end
  end

  defp renew_login(login) do
    tokens = Supermarket.access_token_from_refresh_token(login.refresh_token)

    login
    |> Login.edit_changeset(%{
      access_token: tokens["access_token"],
      refresh_token: tokens["refresh_token"]
    })
    |> Repo.update!()
  end
end
