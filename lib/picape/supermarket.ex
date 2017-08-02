defmodule Picape.Supermarket do
  use HTTPoison.Base

  def products_by_id(product_id) do
    get!("/product/#{product_id}")
  end

  def add_product(product_id, count \\ 1) do
    post!(
      "/cart/add_product",
      %{"product_id": product_id, "count": count},
      [{"Content-type", "application/json"}]
    ).body
  end

  def remove_product(product_id, count \\ 1) do
    post!(
      "/cart/remove_product",
      %{"product_id": product_id, "count": count},
      [{"Content-type", "application/json"}]
    ).body
  end

  def cart_cached() do
    ConCache.get_or_store(:supermarket, :order, &cart/0)
  end

  def cart() do
    get!("/cart").body
  end

  def image_url(image_id) do
    "https://static.supermarket.nl/images/" <> image_id <> "/small.png"
  end

  # ---

  defp process_url(url) do
    config(:base_url) <> url
  end

  def process_response_body(body) do
    Poison.decode!(body)
  end

  defp process_request_headers(headers) do
    Enum.into(headers, [
      "Accept": "*/*",
      "Accept-Language": "nl-NL",
      "x-supermarket-agent": config(:agent),
      "x-supermarket-did": config(:did),
      "x-supermarket-auth": config(:auth),
      "User-Agent": config(:user_agent),
    ])
  end

  defp process_request_body(body) do
    Poison.encode!(body)
  end

  defp process_request_options(options) do
    Enum.into(options, [
      cookie: [config(:cookie)]
    ])
  end

  defp config(key) do
    Application.get_env(:picape, __MODULE__)[key]
  end
end
