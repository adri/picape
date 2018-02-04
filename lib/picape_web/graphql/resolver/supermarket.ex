defmodule PicapeWeb.Graphql.Resolver.Supermarket do
  alias Picape.Supermarket

  def search(_parent, attributes, _info) do
    {:ok, Supermarket.search(attributes[:query])}
  end
end
