use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :picape, PicapeWeb.Endpoint,
  http: [port: 4001],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

# Configure mailer for test mode
config :picape, Picape.Mailer,
  adapter: Swoosh.Adapters.Test

# Configure your database
config :picape, Picape.Repo,
  adapter: Ecto.Adapters.Postgres,
  database: System.get_env("DATABASE_DB") || "picape_test",
  hostname: System.get_env("DATABASE_HOST") || "localhost",
  username: System.get_env("DATABASE_POSTGRESQL_USERNAME") || "postgres",
  password: System.get_env("DATABASE_POSTGRESQL_PASSWORD") || "postgres",
  pool: Ecto.Adapters.SQL.Sandbox,
  ownership_timeout: 60_000
