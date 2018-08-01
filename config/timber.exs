use Mix.Config

# For the following environments, do not log to the Timber service. Instead, log to STDOUT
# and format the logs properly so they are human readable.
environments_to_exclude = [:test, :dev]

if Enum.member?(environments_to_exclude, Mix.env()) do
  # Fall back to the default `:console` backend with the Timber custom formatter
  config :logger,
    backends: [:console],
    utc_log: false

  #  config :logger, :console,
  #    format: {Timber.Formatter, :format},
  #    metadata: [:timber_context, :event, :application, :file, :function, :line, :module, :meta]

  #  config :timber, Timber.Formatter,
  #    colorize: true,
  #    format: :logfmt,
  #    print_timestamps: true,
  #    print_log_level: false,
  #    print_metadata: false # turn this on to view the additional metadata
else
  # Update the instrumenters so that we can structure Phoenix logs
  config :picape, PicapeWeb.Endpoint, instrumenters: [Timber.Integrations.PhoenixInstrumenter]

  # Structure Ecto logs
  config :picape, Picape.Repo, loggers: [{Timber.Integrations.EctoLogger, :log, []}]

  # Use Timber as the logger backend
  # Feel free to add additional backends if you want to send you logs to multiple devices.
  # Deliver logs via HTTP to the Timber API by using the Timber HTTP backend.
  config :logger,
    backends: [Timber.LoggerBackends.HTTP],
    utc_log: true

  config :timber, api_key: {:system, "TIMBER_LOGS_KEY"}
end

# Need help?
# Email us: support@timber.io
# Or, file an issue: https://github.com/timberio/timber-elixir/issues
