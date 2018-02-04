defmodule Picape.SubscriptionCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      # use Picape.DataCase, async: true
      use PicapeWeb.ChannelCase
      use Absinthe.Phoenix.SubscriptionTest, schema: PicapeWeb.Graphql.Schema

      setup do
        {:ok, socket} = Phoenix.ChannelTest.connect(PicapeWeb.UserSocket, %{})
        {:ok, socket} = Absinthe.Phoenix.SubscriptionTest.join_absinthe(socket)

        {:ok, socket: socket}
      end
    end
  end
end
