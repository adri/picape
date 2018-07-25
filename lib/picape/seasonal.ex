defmodule Picape.Seasonal do
  use HTTPoison.Base

  alias Picape.Ingredients
  alias Picape.Seasonal.Parser

  def product_infos() do
    ConCache.get_or_store(:supermarket, :all_seasonal_parsed, fn ->
      get_seasonal_html()
      |> Parser.parse_html()
    end)
  end

  def seasons_for_ingredients(
        ingredients,
        month \\ DateTime.utc_now().month,
        product_infos \\ product_infos()
      ) do
    ingredients
    |> Enum.reduce(%{}, fn ingredient, ingredient_season ->
      Map.merge(ingredient_season, %{
        ingredient.id => find_season(product_infos(), ingredient, month)
      })
    end)
  end

  defp find_season(product_infos, ingredient, month) do
    info =
      Enum.find(product_infos, fn info ->
       info.month === month
        && ingredient[:additional_info] =~ info.country_nl
        && ingredient.seasonal_name == info.product_name_nl
      end)
  end

  defp get_seasonal_html() do
    get!(
      "/?prod=&month=alle&labela=A&labelb=B&labelc=C&labeld=D&labele=E&action=searching"
    ).body
  end

  defp process_url(url) do
    config(:base_url) <> url
  end

  defp config(key) do
    Application.get_env(:picape, __MODULE__)[key]
  end
end
