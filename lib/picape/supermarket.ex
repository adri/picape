defmodule Picape.Supermarket do
  use HTTPoison.Base

  alias Picape.Ingredients
  alias Picape.Supermarket.KeepLogin
  alias Picape.Supermarket.SearchResult
  alias Picape.Supermarket.CartItems

  def search(""), do: []

  def search(query) do
    get!("/mobile-services/product/search/v2?page=0&query=#{Plug.Conn.Query.encode(query)}&sortOn=RELEVANCE").body
    |> SearchResult.from_result()
  end

  def products_by_id(product_id) do
    ConCache.get_or_store(:supermarket, "product-#{product_id}", fn ->
      get!("/mobile-services/product/detail/v4/fir/#{product_id}").body
    end)
  end

  def apply_changes(changes, attempt \\ 1) do
    with cart <- cart(),
         items <- CartItems.apply_changes(changes, &product_title_by_id/1) do
      post!(
        "/mobile-services/v7/order/items",
        %{"items" => items},
        "Content-Type": "application/json",
        "Appie-Current-Order-Id": cart["id"]
      )
      |> case do
        %{status_code: 200, body: cart} ->
          ConCache.put(:supermarket, :cart, cart)
          {:ok, cart}

        # Conflict, try again
        %{status_code: 409} ->
          apply_changes(changes)

        # "Random" error, try again 3x times
        %{status_code: 400} ->
          if attempt >= 3 do
            {:error, :sync_failed}
          else
            apply_changes(changes, attempt + 1)
          end

        _ ->
          {:error, :sync_failed}
      end
    end
  end

  def cart() do
    ConCache.get_or_store(:supermarket, :cart, fn ->
      case get!("/mobile-services/shoppinglist/v2/shoppinglist") do
        %{status_code: 200, body: cart} ->
          cart

        # When an order has a delivery slot, the endpoint changes
        %{status_code: 412, body: _cart} ->
          get!("/mobile-services/v7/order/summaries/active").body

        _ ->
          raise RuntimeError
      end
    end)
  end

  def invalidate_cart() do
    ConCache.delete(:supermarket, :cart)
  end

  def orders() do
    ConCache.get_or_store(:supermarket, :orders, fn ->
      get!("/mobile-services/v4/order/summaries").body
    end)
  end

  def access_token_from_refresh_token(refresh_token) do
    post!(
      "/mobile-auth/v1/auth/token/refresh",
      %{
        "refreshToken" => refresh_token,
        "clientId" => "appie"
      },
      "Content-Type": "application/json",
      "X-Refresh-Token": true
    ).body
  end

  def invalidate_orders() do
    ConCache.delete(:supermarket, :orders)
  end

  def latest_order_id(orders) do
    try do
      # before delivering, the latest order is in "current_orders"
      # after delivering, in "orders"
      processing_order_id = get_in(orders, ["current_orders", Access.at(0), "order_id"])
      delivered_order_id = get_in(orders, ["orders", Access.at(0), "order_id"])

      processing_order_id || delivered_order_id
    rescue
      _e in RuntimeError -> nil
    end
  end

  def image_url(item) do
    case Enum.at(item["images"] || [], 2) do
      nil -> "http://placekitten.com/64/64"
      image -> image["url"]
    end
  end

  # ---

  def product_title_by_id(supermarket_id) do
    Ingredients.by_supermarket_id(supermarket_id)[:original_title] ||
      get_in(products_by_id(supermarket_id), ["productCard", "title"]) ||
      ""
  end

  defp process_url(url) do
    config(:base_url) <> url
  end

  def process_response_body(body) do
    case Poison.decode(body) do
      {:ok, value} ->
        value

      {:error, :invalid, pos} ->
        IO.inspect(body)
        raise Poison.SyntaxError, pos: pos

      {:error, {:invalid, token, pos}} ->
        IO.inspect(body)
        raise Poison.SyntaxError, token: token, pos: pos
    end
  end

  defp process_request_headers(headers) do
    headers
    |> Keyword.merge(Accept: "*/*")
    |> Keyword.merge(config(:headers) || [])
    |> Keyword.merge(
      "X-Correlation-Id": "/zoeken/producten-#{Ecto.UUID.generate() |> String.upcase()}"
    )
    |> maybe_add_authorization_bearer(Keyword.has_key?(headers, :"X-Refresh-Token"))
    |> IO.inspect(label: "160")
  end

  defp maybe_add_authorization_bearer(headers, true), do: headers

  defp maybe_add_authorization_bearer(headers, false) do
    headers
    |> Keyword.merge(Authorization: "Bearer #{KeepLogin.get_access_token()}")
  end

  defp process_request_body(""), do: ""

  defp process_request_body(body) do
    Poison.encode!(body)
  end

  # defp process_request_options(options) do
  #   options
  #   |> Keyword.merge(
  #     hackney: [
  #       {:proxy, {"localhost", 8888}},
  #       {:ssl_options,
  #        [
  #          {:versions, [:"tlsv1.2"]},
  #          {:cacertfile, "/Users/adrimbp/workspace/proxyman-ca.pem"}
  #        ]}
  #     ]
  #   )
  # end

  defp config(key) do
    Application.get_env(:picape, __MODULE__)[key]
  end
end
