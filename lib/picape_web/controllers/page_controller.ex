defmodule PicapeWeb.PageController do
  use PicapeWeb, :controller

  alias Picape.{Recipe}

  def index(conn, _params) do
    conn
    |> put_resp_header("location", "//index.html")
    |> send_resp(301, "index.html")
  end
end
