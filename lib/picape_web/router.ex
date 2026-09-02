defmodule PicapeWeb.Router do
  use PicapeWeb, :router

  get("/", PicapeWeb.PageController, :index)

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

  post("/shortcut/ingredient/search", PicapeWeb.ShortcutController, :search_ingredient)
  post("/shortcut/ingredient/add", PicapeWeb.ShortcutController, :add_ingredient)
  post("/shortcut/ingredient/add_by_id", PicapeWeb.ShortcutController, :add_ingredient_by_id)
  post("/shortcut/ingredient/remove", PicapeWeb.ShortcutController, :remove_ingredient)

  if Mix.env() == :dev do
    post("/dev/invalidate-cart", PicapeWeb.DevController, :invalidate_cart)
  end
end
