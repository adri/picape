import Config

if config_env() == :prod do
  # other configuration from prod.secret.exs

  config :picape, PicapeWeb.Endpoint, server: true

  config :picape, Picape.Repo,
    adapter: Ecto.Adapters.Postgres,
    url: System.get_env("DATABASE_URL"),
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
    ssl: false,
    socket_options: [:inet6]

  config :picape, Picape.Supermarket,
    base_url: System.get_env("SUPERMARKET_BASE_URL"),
    static_url: System.get_env("SUPERMARKET_STATIC_URL"),
    headers: [
      "Accept-Language": "en-NL;q=1.0, de-NL;q=0.9, nl-NL;q=0.8",
      "Accept-Encoding": "br;q=1.0, gzip;q=0.9, deflate;q=0.8",
      "X-Correlation-Id": System.get_env("SUPERMARKET_CORRELATION_ID"),
      "X-ClientVersion": System.get_env("SUPERMARKET_CLIENT_VERSION"),
      "X-Clientname": System.get_env("SUPERMARKET_CLIENT_NAME"),
      "User-Agent": System.get_env("SUPERMARKET_USER_AGENT")
    ]
end
