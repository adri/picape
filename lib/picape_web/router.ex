defmodule PicapeWeb.Router do
  use PicapeWeb, :router
  use Plug.ErrorHandler
  use Sentry.Plug

  forward(
    "/graphql",
    Absinthe.Plug,
    schema: PicapeWeb.Graphql.Schema,
    json_codec: Jason
  )

  forward(
    "/graphiql",
    Absinthe.Plug.GraphiQL,
    schema: PicapeWeb.Graphql.Schema,
    socket: PicapeWeb.UserSocket,
    interface: :playground
  )

  forward("/", ReverseProxy, upstream: ["0.0.0.0:4001"])
end
