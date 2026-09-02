defmodule Picape.Supermarket.KeepLogin do
  @moduledoc """
  Uses a refresh token to keep a login (valid token) to the
  supermarket.

  Set `config :picape, Picape.Supermarket.KeepLogin, refresh: false` to hand
  out the stored access token without ever refreshing it. Refresh tokens
  rotate on use, so a copy of the production login must not refresh locally
  or production loses its session.
  """
  alias Picape.Repo
  alias Picape.Supermarket
  alias Picape.Supermarket.Login

  def get_access_token() do
    case Repo.one(Login) do
      nil ->
        nil

      login ->
        if Login.expired?(login) and refresh_enabled?() do
          renew_login(login).access_token
        else
          login.access_token
        end
    end
  end

  defp refresh_enabled? do
    Keyword.get(Application.get_env(:picape, __MODULE__, []), :refresh, true)
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
