defmodule PicapeWeb.MCPController do
  use PicapeWeb, :controller

  alias Picape.MCP

  @doc """
  The MCP endpoint. One JSON-RPC message per POST, one response per request.
  """
  def handle(conn, _params) do
    if allowed_origin?(conn) do
      reply(conn, MCP.handle(conn.body_params))
    else
      conn
      |> put_status(:forbidden)
      |> json(%{jsonrpc: "2.0", error: %{code: -32_600, message: "origin not allowed"}})
    end
  end

  @doc """
  Every other verb on the endpoint. The transport is POST only: there is no
  GET stream to open and no session to DELETE.
  """
  def not_allowed(conn, _params), do: send_resp(conn, :method_not_allowed, "")

  # The transport spec makes Origin validation mandatory against DNS rebinding.
  # MCP clients are not browsers and send no Origin at all, so treating any
  # Origin as invalid rejects every web page without needing to know which
  # hosts are ours.
  defp allowed_origin?(conn), do: get_req_header(conn, "origin") == []

  defp reply(conn, {:reply, message}), do: json(conn, message)

  # A notification has no response. The spec asks for 202 and an empty body.
  defp reply(conn, :noreply), do: send_resp(conn, :accepted, "")
end
