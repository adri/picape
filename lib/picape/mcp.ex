defmodule Picape.MCP do
  @moduledoc """
  MCP server speaking JSON-RPC 2.0, mounted by the router at `/mcp`.

  A tool-only server needs three requests: `initialize`, `tools/list` and
  `tools/call`. `Picape.MCP.Tools` holds the tools; this module is the wire.
  """

  alias Picape.MCP.Tools

  @protocol_version "2025-11-25"
  @server_info %{name: "picape", version: "0.1.0"}

  @doc """
  Turns one decoded JSON-RPC message into the message to send back, or
  `:noreply` for a notification.
  """
  @spec handle(map) :: {:reply, map} | :noreply
  def handle(%{"method" => method, "id" => id} = request) do
    {:reply, envelope(id, result(method, request["params"] || %{}))}
  end

  def handle(%{"method" => _notification}), do: :noreply

  def handle(_message), do: {:reply, envelope(nil, {:error, -32_600, "invalid request"})}

  defp result("initialize", _params) do
    {:ok,
     %{
       protocolVersion: @protocol_version,
       capabilities: %{tools: %{}},
       serverInfo: @server_info
     }}
  end

  defp result("ping", _params), do: {:ok, %{}}

  defp result("tools/list", _params), do: {:ok, %{tools: Tools.list()}}

  defp result("tools/call", %{"name" => name} = params) do
    case Tools.call(name, params["arguments"] || %{}) do
      {:ok, value} -> {:ok, %{content: [text(value)], isError: false}}
      {:error, message} -> {:ok, %{content: [text(%{error: message})], isError: true}}
      :unknown_tool -> {:error, -32_602, "unknown tool #{name}"}
    end
  end

  defp result(method, _params), do: {:error, -32_601, "unknown method #{method}"}

  defp envelope(id, {:ok, result}), do: %{jsonrpc: "2.0", id: id, result: result}

  defp envelope(id, {:error, code, message}) do
    %{jsonrpc: "2.0", id: id, error: %{code: code, message: message}}
  end

  defp text(value), do: %{type: "text", text: Jason.encode!(value, pretty: true)}
end
