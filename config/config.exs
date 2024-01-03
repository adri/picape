# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :picape, ecto_repos: [Picape.Repo]

# Configures the endpoint
config :picape, PicapeWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "/XS66yr6BbUsl0+u0pjJIxa0lK5whxGGWGZLuWuBSCbnmNcsRLz+gvyRathkiAM8",
  render_errors: [view: PicapeWeb.ErrorView, accepts: ~w(html json)],
  pubsub_server: Picape.PubSub

config :picape, Picape.Scheduler,
  jobs: [
    # Runs every midnight
    {"@daily", {Picape.Supermarket, :invalidate_orders, []}},
    {"@daily", {Picape.Order, :sync_supermarket, ["1"]}},
    {"@daily", {Picape.Supermarket.KeepLogin, :get_access_token, []}},
    {"@daily", {Picape.Ingredients, :match_supermarket_products, []}}
  ]

config :new_relic_agent,
  app_name: "picape",
  license_key: System.get_env("NEW_RELIC_LICENSE_KEY"),
  logs_in_context: :direct

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :absinthe, schema: PicapeWeb.Graphql.Schema

config :sentry,
  dsn: System.get_env("SENTRY_DSN"),
  included_environments: [:prod],
  environment_name: Mix.env(),
  enable_source_code_context: true,
  json_library: Jason,
  root_source_code_path: File.cwd!(),
  use_error_logger: true,
  tags: %{
    env: "production"
  }

config :picape, :supermarket, Picape.Supermarket

config :picape, Picape.Seasonal, base_url: "https://groentefruit.milieucentraal.nl/"

config :phoenix, :json_library, Jason
config :phoenix, :format_encoders, json: Jason
config :mix_docker, image: "adri/picape"

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"

# Import Timber, structured logging
# import_config "timber.exs"
