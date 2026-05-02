defmodule Picape.Repo do
  use Ecto.Repo, otp_app: :picape, adapter: Ecto.Adapters.Postgres

  @doc """
  Dynamically loads the repository url from the
  DATABASE_URL environment variable.
  """
  def init(_, opts) do
    case System.get_env("DATABASE_URL") do
      nil -> {:ok, opts}
      url -> {:ok, Keyword.put(opts, :url, url)}
    end
  end
end
