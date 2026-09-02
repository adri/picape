defmodule Picape.Mixfile do
  use Mix.Project

  def project do
    [
      app: :picape,
      version: "0.0.1",
      elixir: "~> 1.4",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:gettext] ++ Mix.compilers(),
      listeners: [Phoenix.CodeReloader],
      start_permanent: Mix.env() == :prod,
      test_coverage: [tool: ExCoveralls],
      aliases: aliases(),
      deps: deps()
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def cli do
    [preferred_envs: [check: :test, coveralls: :test, "coveralls.json": :test]]
  end

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
      {:absinthe, "~> 1.11"},
      {:absinthe_phoenix, "~> 2.0.0"},
      {:absinthe_plug, "~> 1.5.10"},
      {:absinthe_relay, "~> 1.6"},
      #  {:absinthe_ecto, "~> 1.0.0"},
      {:cors_plug, "~> 1.4"},
      {:con_cache, "~> 0.13.0"},
      {:ecto_sql, "~> 3.14"},
      {:excoveralls, "~> 0.18", only: :test},
      {:floki, "~> 0.36"},
      {:jason, "~> 1.1"},
      {:phoenix, "~> 1.8"},
      {:phoenix_pubsub, "~> 2.0"},
      {:phoenix_ecto, "~> 4.0"},
      {:plug_cowboy, "~> 2.3"},
      {:postgrex, ">= 0.0.0"},
      {:phoenix_html, "~> 2.14.3"},
      {:phoenix_view, "~> 2.0"},
      {:phoenix_live_reload, "~> 1.0", only: :dev},
      {:sentry, "~> 7.0"},
      {:gettext, "~> 0.11"},
      # {:cowboy, "~> 2.7.0"},
      {:new_relic_agent, "~> 1.0"},
      {:poison, "~> 3.0"},
      {:httpoison, "~> 1.8.0"},
      {:mix_test_watch, "~> 0.3", only: :dev, runtime: false},
      {:quantum, "~> 3.0"},
      {:credo, "~> 1.7", only: [:dev, :test], runtime: false},
      {:sobelow, "~> 0.13", only: [:dev, :test], runtime: false},
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
      "graphql.schema": [
        "loadpaths",
        "absinthe.schema.sdl --schema PicapeWeb.Graphql.Schema priv/graphql/schema.graphql"
      ],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"],
      check: [
        "format --check-formatted",
        "credo --strict",
        "compile --force --warnings-as-errors",
        "test --warnings-as-errors",
        "sobelow --exit Low --skip --ignore Config.HTTPS"
      ]
    ]
  end
end
