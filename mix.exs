defmodule Picape.Mixfile do
  use Mix.Project

  def project do
    [
      app: :picape,
      version: "0.0.1",
      elixir: "~> 1.4",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:phoenix, :gettext] ++ Mix.compilers(),
      start_permanent: Mix.env() == :prod,
      test_coverage: [tool: ExCoveralls],
      aliases: aliases(),
      deps: deps()
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {Picape.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib", "test"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:absinthe, "~> 1.5.5"},
      {:absinthe_phoenix, "~> 2.0.0"},
      {:absinthe_plug, "~> 1.5.5"},
      {:absinthe_relay, "~> 1.5.1"},
      #  {:absinthe_ecto, "~> 1.0.0"},
      {:cors_plug, "~> 1.4"},
      {:con_cache, "~> 0.13.0"},
      {:ecto_sql, "~> 3.0"},
      {:excoveralls, "~> 0.8.0", only: :test},
      {:floki, "~> 0.20.0"},
      {:jason, "~> 1.1"},
      {:phoenix, "~> 1.6.5"},
      {:phoenix_pubsub, "~> 2.0"},
      {:phoenix_ecto, "~> 4.0"},
      {:plug_cowboy, "~> 2.3"},
      {:postgrex, ">= 0.0.0"},
      {:phoenix_html, "~> 2.14.3"},
      {:phoenix_live_reload, "~> 1.0", only: :dev},
      {:sentry, "~> 7.0"},
      {:gettext, "~> 0.11"},
      # {:cowboy, "~> 2.7.0"},
      {:new_relic_agent, "~> 1.0"},
      {:poison, "~> 3.0"},
      {:httpoison, "~> 1.8.0"},
      {:mix_test_watch, "~> 0.3", only: :dev, runtime: false},
      {:quantum, "~> 3.0"},
      {:credo, "~> 0.7", only: [:dev, :test]},
      {:mix_docker, "~> 0.5.0"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to create, migrate and run the seeds file at once:
  #
  #     $ mix ecto.setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      "graphql.schema": ["loadpaths", "absinthe.schema.json"],
      test: ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end
end
