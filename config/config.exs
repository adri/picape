# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :picape,
  ecto_repos: [Picape.Repo]

# Configures the endpoint
config :picape, PicapeWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "/XS66yr6BbUsl0+u0pjJIxa0lK5whxGGWGZLuWuBSCbnmNcsRLz+gvyRathkiAM8",
  render_errors: [view: PicapeWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Picape.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :reverse_proxy,
  upstreams: %{
    "0.0.0.0:4001" => ["http://0.0.0.0:4001"],
    "picape-beta.herokuapp.com" => ["http://0.0.0.0:4001"],
  }

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
