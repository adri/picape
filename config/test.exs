import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :picape, PicapeWeb.Endpoint,
  http: [port: 4001],
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Configure your database
config :picape, Picape.Repo,
  adapter: Ecto.Adapters.Postgres,
  database: System.get_env("DATABASE_DB") || "picape_test",
  hostname: System.get_env("DATABASE_HOST") || "localhost",
  port: String.to_integer(System.get_env("DATABASE_PORT") || "5433"),
  username: System.get_env("DATABASE_POSTGRESQL_USERNAME") || "postgres",
  password: System.get_env("DATABASE_POSTGRESQL_PASSWORD") || "postgres",
  pool: Ecto.Adapters.SQL.Sandbox,
  ownership_timeout: 60_000

config :picape, Picape.Supermarket, base_url: "http://localhost:4021", headers: []
