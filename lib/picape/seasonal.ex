defmodule Picape.Seasonal do
  use HTTPoison.Base
  use Agent

  @seasonal_path "/?prod=&month=alle&labela=A&labelb=B&labelc=C&labeld=D&labele=E&action=searching"

  alias Picape.Seasonal.Parser

  def start_link() do
    Agent.start_link(fn -> product_infos() end, name: __MODULE__)
  end

  def product_infos() do
    ConCache.get_or_store(:supermarket, :all_seasonal_parsed, fn ->
      get_seasonal_html()
      |> Parser.parse_html()
    end)
  end

  def seasons_for_ingredients(
        ingredients,
        month \\ DateTime.utc_now().month
      ) do
    ingredients
    |> Enum.reduce(%{}, fn ingredient, ingredient_season ->
      Map.merge(ingredient_season, %{
        ingredient.id =>
          find_season(
            ingredient[:additional_info],
            ingredient.seasonal_name,
            month
          )
      })
    end)
  end

  defp find_season(country_info, seasonal_name, month) do
    Agent.get(__MODULE__, fn product_infos ->
      Enum.find(product_infos, fn info ->
        info.month === month && country_info =~ info.country_nl && seasonal_name == info.product_name_nl
      end)
    end)
  end

  defp get_seasonal_html() do
    get!(@seasonal_path).body
  end

  defp process_url(url) do
    config(:base_url) <> url
  end

  defp config(key) do
    Application.get_env(:picape, __MODULE__)[key]
  end
end
