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

  post("/shortcut/ingredient/add", PicapeWeb.ShortcutController, :add_ingredient)
  post("/shortcut/ingredient/add_by_id", PicapeWeb.ShortcutController, :add_ingredient_by_id)
  post("/shortcut/ingredient/remove", PicapeWeb.ShortcutController, :remove_ingredient)

  forward("/", ReverseProxyPlug, upstream: "http://127.0.0.1:4001")
end
