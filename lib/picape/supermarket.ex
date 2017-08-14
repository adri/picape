defmodule Picape.Supermarket do
  use HTTPoison.Base

  alias Picape.Supermarket.SearchResult

  def search(query) do
    get!("/search?search_term=#{query}").body
    |> SearchResult.from_result
  end

  def products_by_id(product_id) do
    get!("/product/#{product_id}").body
  end

  def apply_changes(changes) do
    changes.add
    |> Enum.each(fn change ->
        ConCache.put(:supermarket, :cart, add_product(change.id, change.quantity))
    end)

    changes.remove
    |> Enum.each(fn change ->
        ConCache.put(:supermarket, :cart, remove_product(change.id, change.quantity))
    end)
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

  def cart() do
    ConCache.get_or_store(:supermarket, :cart, fn ->
      get!("/cart").body
    end)
  end

  def invalidate_cart() do
    ConCache.delete(:supermarket, :cart)
  end

  def orders() do
    ConCache.get_or_store(:supermarket, :orders, fn ->
      get!("/order").body
    end)
  end

  def image_url(image_id) do
    case image_id do
      nil -> "http://placekitten.com/64/64"
      _ -> "https://static.supermarket.nl/images/" <> image_id <> "/small.png"
    end
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
