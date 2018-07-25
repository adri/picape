defmodule Picape.Seasonal.Parser do
  alias Picape.Seasonal.SeasonalInfo

  def parse_html(html) do
    for product_info <- map_products(html),
        label_info <- map_label_info(product_info),
        month_info <- map_month_info(label_info),
        country_info <- map_country_info(month_info) do
      %SeasonalInfo{
        country_nl: country_name(country_info),
        description_nl: description(country_info),
        label: label_name(label_info),
        month: month_number(month_info),
        product_name_nl: product_name(product_info)
      }
    end

    #    map_label_info(result)
    #    |> Enum.map(fn label_info ->
    #      map_month_info(label_info)
    #      |> Enum.map(fn month_info ->
    #        map_country_info(month_info)
    #        |> Enum.map(fn country_info ->
    #           %{
    #             "country": country_name(country_info),
    #             "label": label_name(label_info),
    #             "month": month_name(month_info),
    #             "product_name": product_name(result)
    #           }
    #        end)
    #      end)
    #    end)
  end

  # ---

  defp map_products(html) do
    Floki.find(html, ".fruit-result")
  end

  defp map_label_info(result) do
    Floki.find(result, ".fruit-result__info > div")
  end

  defp map_month_info(label_info) do
    Enum.zip(
      Floki.find(label_info, ".fruit-result__label-data .fruit-result__month"),
      Floki.find(
        label_info,
        ".fruit-result__label-data .fruit-result__countries"
      )
    )
  end

  defp map_country_info({_month_info, country_info}) do
    Floki.find(country_info, "span")
  end

  defp product_name(product_info) do
    Floki.find(product_info, ".fruit-result__product > span")
    |> Floki.text()
  end

  defp label_name(label_info) do
    Floki.find(label_info, ".fruit-result__label > span")
    |> Floki.text()
  end

  defp month_number({month_info, _country_info}) do
    Floki.find(month_info, "span")
    |> Floki.text()
    |> String.capitalize()
    |> month_name_to_number()
  end

  defp month_name_to_number(month_name) do
    %{
      "Januari" => 1,
      "Februari" => 2,
      "Maart" => 3,
      "April" => 4,
      "Mei" => 5,
      "Juni" => 6,
      "Juli" => 7,
      "Augustus" => 8,
      "September" => 9,
      "Oktober" => 10,
      "November" => 11,
      "December" => 12
    }[month_name]
  end

  defp country_name(country_info) do
    Floki.find(country_info, "span")
    |> Floki.text()
    |> String.trim()
    |> String.trim(",")
  end

  defp description(country_info) do
    Floki.attribute(country_info, "title")
  end
end
