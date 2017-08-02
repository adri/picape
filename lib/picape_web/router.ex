defmodule PicapeWeb.Router do
  use PicapeWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  # scope "/", PicapeWeb do
  #   pipe_through :browser # Use the default browser stack
  # end

  # Other scopes may use custom stacks.
  scope "/api", PicapeWeb do
    pipe_through :api

    get "/", PageController, :index
  end

  forward "/graphql", Absinthe.Plug, schema: PicapeWeb.Graphql.Schema
  forward "/graphiql", Absinthe.Plug.GraphiQL,
    schema: PicapeWeb.Graphql.Schema,
    socket: PicapeWeb.UserSocket,
    interface: :simple

  if Mix.env == :dev do
    scope "/dev" do
      pipe_through [:browser]

      forward "/mailbox", Plug.Swoosh.MailboxPreview, [base_path: "/dev/mailbox"]
    end
  end
end
