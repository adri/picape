defmodule PicapeWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :picape
  use Absinthe.Phoenix.Endpoint

  socket("/socket", PicapeWeb.UserSocket,
    check_origin: [
      "//picape.whybug.com",
      "//web-build.adri.now.sh",
      "https://web-build-adri.vercel.app",
      "//localhost"
    ]
  )

  # Serve at "/" the static files from "priv/static" directory.
  #
  # You should set gzip to true if you are running phoenix.digest
  # when deploying your static files in production.
  plug(
    Plug.Static,
    at: "/",
    from: :picape,
    gzip: false,
    only:
      ~w(css fonts images js favicon.ico robots.txt asset-manifest.json favicon-16.png favicon-32.png favicon.ico index.html manifest.json pwa serve.json service-worker.js service-worker.js.map static)
  )

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    socket("/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket)
    plug(Phoenix.LiveReloader)
    plug(Phoenix.CodeReloader)
  end

  plug(Plug.RequestId)

  plug(
    Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Jason
  )

  plug(Plug.MethodOverride)
  plug(Plug.Head)

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  #  plug Plug.Session,
  #    store: :cookie,
  #    key: "_picape_key",
  #    signing_salt: "iO7xCAa+"

  plug(CORSPlug)
  # Add Timber plugs for capturing HTTP context and events
  # plug(Timber.Integrations.SessionContextPlug)
  # plug(Timber.Integrations.HTTPContextPlug)
  # plug(Timber.Integrations.EventPlug)

  plug(PicapeWeb.Router)

  @doc """
  Dynamically loads configuration from the system environment
  on startup.

  It receives the endpoint configuration from the config files
  and must return the updated configuration.
  """
  def load_from_system_env(config) do
    port = System.get_env("PORT") || raise "expected the PORT environment variable to be set"

    host = System.get_env("HOST") || config.url[:host] || raise "expected the HOST environment variable to be set"

    secret_key_base =
      System.get_env("SECRET_KEY_BASE") || config.secret_key_base ||
        raise "expected the SECRET_KEY_BASE environment variable to be set"

    config =
      config
      |> Keyword.put(:http, [:inet6, port: port])
      |> Keyword.put(:url, host: host, port: port)
      |> Keyword.put(:secret_key_base, secret_key_base)

    {:ok, config}
  end
end
