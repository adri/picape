defmodule Picape.Seasonal do
  use HTTPoison.Base
  use Agent

  @seasonal_path "/?prod=&month=alle&labela=A&labelb=B&labelc=C&labeld=D&labele=E&action=searching"

  alias Picape.Seasonal.Parser

  def start_link(_state) do
    Agent.start_link(fn -> product_infos() end, name: __MODULE__)
  end

  def product_infos() do
    ConCache.get_or_store(:supermarket, :all_seasonal_parsed, fn ->
      get_seasonal_html()
      |> Parser.parse_html()
    end)
  end

  def seasons_for_ingredients(
        _ingredients,
        _month \\ DateTime.utc_now().month
      ) do
    %{}
  end

  defp get_seasonal_html() do
    get!(@seasonal_path).body
  end

  def process_url(url) do
    config(:base_url) <> url
  end

  defp config(key) do
    Application.get_env(:picape, __MODULE__)[key]
  end
end
