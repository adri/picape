import Config

if config_env() == :prod do
  # other configuration from prod.secret.exs

  config :picape, PicapeWeb.Endpoint, server: true
end
