defmodule Picape.Supermarket do
  use HTTPoison.Base

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

  def apply_changes(changes) do
    with cart <- cart(),
         items <- CartItems.from_supermarket_cart(cart),
         items <- CartItems.apply_changes(items, changes, &products_by_id/1) do
      post!(
        "/mobile-services/shoppinglist/v2/shoppinglist",
        %{
          "activeSorting" => cart["activeSorting"],
          "dateLastSyncedMillis" => cart["dateLastSyncedMillis"],
          "items" => items
        },
        "Content-Type": "application/json"
      )
      |> case do
        %{status_code: 200, body: cart} ->
          ConCache.put(:supermarket, :cart, cart)
          {:ok, cart}

        # Conflict, try again
        %{status_code: 409} ->
          invalidate_cart()
          apply_changes(changes)

        _ ->
          {:error, :sync_failed}
      end
    end
  end

  def cart() do
    ConCache.get_or_store(:supermarket, :cart, fn ->
      get!("/mobile-services/shoppinglist/v2/shoppinglist").body
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
    post!("/refresh-token?client=appie&refresh_token=#{refresh_token}", nil, "X-Refresh-Token": true).body
  end

  @spec invalidate_orders :: :ok
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

  defp process_url(url) do
    config(:base_url) <> url
  end

  def process_response_body(body) do
    # IO.inspect(body)
    Poison.decode!(body)
  end

  defp process_request_headers(headers) do
    headers =
      headers
      |> Keyword.merge(Accept: "*/*")
      |> Keyword.merge("X-Correlation-Id": "/zoeken/producten-#{Ecto.UUID.generate() |> String.upcase()}")
      |> Keyword.merge(config(:headers) || [])

    if Keyword.has_key?(headers, :"X-Refresh-Token") do
      headers
    else
      headers
      |> Keyword.merge(Authorization: "Bearer #{KeepLogin.get_access_token()}")
    end
  end

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
