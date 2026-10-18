defmodule Mix.Tasks.Picnic.Login do
  @moduledoc """
  Trades Picnic credentials for an auth key and stores it in
  `config/dev.secret.exs`, so the key never lands in shell output or logs.

      mix picnic.login you@example.com your-password

  When the account asks for a second factor the task sends the code by SMS
  and asks for it. It prints "ok" once the key is stored, and nothing else.
  """
  use Mix.Task

  alias Picape.Picnic

  @shortdoc "Store a Picnic auth key in config/dev.secret.exs"
  @impl Mix.Task
  def run([username, password]) do
    Mix.Task.run("app.start")

    case Picnic.login(username, password) do
      {:ok, auth_key} ->
        store(auth_key)

      {:error, {:second_factor_required, auth_key}} ->
        Picnic.generate_2fa(auth_key)
        otp = Mix.shell().prompt("Enter the code Picnic sent") |> String.trim()
        Picnic.verify_2fa(auth_key, otp)
        store(auth_key)

      {:error, reason} ->
        Mix.raise("Picnic login failed: #{inspect(reason)}")
    end
  end

  def run(_args) do
    Mix.raise("usage: mix picnic.login USERNAME PASSWORD")
  end

  defp store(auth_key) do
    path = Path.expand("config/dev.secret.exs")
    line = "config :picape, Picape.Picnic, auth_key: #{inspect(auth_key)}"

    contents =
      case File.read(path) do
        {:ok, existing} -> upsert_line(existing, line)
        {:error, _} -> "import Config\n\n" <> line <> "\n"
      end

    File.write!(path, contents)
    Mix.shell().info("ok")
  end

  defp upsert_line(contents, line) do
    if Regex.match?(~r/^config :picape, Picape\.Picnic, auth_key:.*$/m, contents) do
      Regex.replace(~r/^config :picape, Picape\.Picnic, auth_key:.*$/m, contents, line)
    else
      String.trim_trailing(contents) <> "\n\n" <> line <> "\n"
    end
  end
end
