defmodule PicapeWeb.PageController do
  use PicapeWeb, :controller

  def index(conn, _params) do
    conn
    |> put_resp_header("location", "/index.html")
    |> send_resp(301, "index.html")
  end
end
