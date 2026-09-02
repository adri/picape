defmodule PicapeWeb.DevController do
  use PicapeWeb, :controller

  alias Picape.Supermarket

  def invalidate_cart(conn, _params) do
    Supermarket.invalidate_cart()
    send_resp(conn, 204, "")
  end
end
