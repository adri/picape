defmodule PicapeWeb.Router do
  use PicapeWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  forward "/graphql", Absinthe.Plug, schema: PicapeWeb.Graphql.Schema
  forward "/graphiql", Absinthe.Plug.GraphiQL,
    schema: PicapeWeb.Graphql.Schema,
    socket: PicapeWeb.UserSocket,
    interface: :simple
  forward "/", ReverseProxy, upstream: ["0.0.0.0:4001"]

  if Mix.env == :dev do
    scope "/dev" do
      pipe_through [:browser]

      forward "/mailbox", Plug.Swoosh.MailboxPreview, [base_path: "/dev/mailbox"]
    end
  end
end
