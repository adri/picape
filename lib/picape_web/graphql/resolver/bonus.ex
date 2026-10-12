defmodule PicapeWeb.Graphql.Resolver.Bonus do
  alias Picape.Bonus

  def offers(_parent, _args, _info) do
    {:ok, Bonus.offers()}
  rescue
    _ -> {:error, "the supermarket is unreachable"}
  end

  def activate(attributes, _info) do
    Bonus.activate(attributes[:offer_id])
  end
end
