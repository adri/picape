defmodule Picape.Application do
  @moduledoc false

  use Application

  # See http://elixir-lang.org/docs/stable/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    import Supervisor.Spec

    # Define workers and child supervisors to be supervised
    children = [
      # Start the Ecto repository
      supervisor(Picape.Repo, []),
      # Start the endpoint when the application starts
      supervisor(PicapeWeb.Endpoint, []),
      supervisor(Absinthe.Subscription, [PicapeWeb.Endpoint]),
    # Start your own worker by calling: Picape.Worker.start_link(arg1, arg2, arg3)
      # worker(Picape.Worker, [arg1, arg2, arg3]),
      worker(Picape.Scheduler, []),
      supervisor(ConCache, [[ttl: :timer.hours(5)], [name: :supermarket]]),
    ]

    # See http://elixir-lang.org/docs/stable/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Picape.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
