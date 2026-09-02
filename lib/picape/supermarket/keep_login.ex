defmodule Picape.Supermarket.KeepLogin do
  @moduledoc """
  Uses a refresh token to keep a login (valid token) to the
  supermarket.
  """
  alias Picape.Repo
  alias Picape.Supermarket
  alias Picape.Supermarket.Login

  def get_access_token() do
    case Repo.one(Login) do
      nil ->
        nil

      login ->
        if Login.expired?(login) do
          renew_login(login).access_token
        else
          login.access_token
        end
    end
  end

  defp renew_login(login) do
    tokens = Supermarket.access_token_from_refresh_token(login.refresh_token)

    login
    |> Login.edit_changeset(%{
      access_token: tokens["access_token"],
      refresh_token: tokens["refresh_token"],
      expires_in: tokens["expires_in"]
    })
    |> Repo.update!()
  end
end
