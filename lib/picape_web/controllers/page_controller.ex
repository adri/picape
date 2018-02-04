defmodule PicapeWeb.PageController do
  use PicapeWeb, :controller

  alias Picape.{Recipe}

  def index(conn, _params) do
    render(
      conn,
      "index.json",
      recipes: Recipe.list_recipes(),
      essentials: Recipe.list_essentials()
    )
  end
end
