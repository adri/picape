import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :picape, PicapeWeb.Endpoint,
  http: [port: 4001],
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# assert_reply/assert_push read this. The first GraphQL mutation over the socket
# costs 58-77ms of warm-up on a fast machine, against a 100ms default, so the
# subscription tests flake on a CI runner with fewer cores. Steady-state replies
# take 4-5ms and subscription pushes under 1ms, so this only covers the warm-up.
config :ex_unit, assert_receive_timeout: 2_000

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
