defmodule Picape.Supermarket.Error do
  @moduledoc """
  The supermarket answered but not with JSON — an outage page, a captive
  portal or a proxy error. The message carries the status and the start of
  the body so a tool result or log line names what actually came back.
  """
  defexception [:message]
end
