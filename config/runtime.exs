import Config

if config_env() == :prod do
  # other configuration from prod.secret.exs

  config :picape, PicapeWeb.Endpoint, server: true

  config :sentry, dsn: System.get_env("SENTRY_DSN")

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
      "X-Application": System.get_env("SUPERMARKET_APPLICATION_NAME"),
      "X-Correlation-Id": System.get_env("SUPERMARKET_CORRELATION_ID"),
      "X-ClientVersion": System.get_env("SUPERMARKET_CLIENT_VERSION"),
      "X-Clientname": System.get_env("SUPERMARKET_CLIENT_NAME"),
      "User-Agent": System.get_env("SUPERMARKET_USER_AGENT")
    ]
end

if config_env() == :dev do
  if base_url = System.get_env("SUPERMARKET_BASE_URL") do
    config :picape, Picape.Supermarket, base_url: base_url
  end

  if System.get_env("SUPERMARKET_REFRESH") == "0" do
    config :picape, Picape.Supermarket.KeepLogin, refresh: false
  end

  if System.get_env("SUPERMARKET_PROXY") do
    proxyman_ca = Path.expand("~/Library/Application Support/com.proxyman.NSProxy/app-data/proxyman-ca.pem")

    config :picape, Picape.Supermarket,
      hackney: [proxy: {"localhost", 9090}, ssl_options: [cacertfile: proxyman_ca, verify: :verify_peer]]
  end
end
