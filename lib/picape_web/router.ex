defmodule PicapeWeb.Router do
  use PicapeWeb, :router
  use Plug.ErrorHandler
  use Sentry.Plug

  forward "/graphql", Absinthe.Plug, schema: PicapeWeb.Graphql.Schema
  forward "/graphiql", Absinthe.Plug.GraphiQL,
    schema: PicapeWeb.Graphql.Schema,
    socket: PicapeWeb.UserSocket,
    interface: :simple
  forward "/", ReverseProxy, upstream: ["0.0.0.0:4001"]
end
