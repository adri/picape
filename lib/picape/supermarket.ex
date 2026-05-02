defmodule Picape.Supermarket do
  use HTTPoison.Base

  alias Picape.Ingredients
  alias Picape.Supermarket.KeepLogin
  alias Picape.Supermarket.SearchResult
  alias Picape.Supermarket.CartItems

  @graphql_path "/graphql"
  @apollo_extensions %{"clientLibrary" => %{"name" => "apollo-ios", "version" => "1.22.0"}}

  @fetch_my_list_basket File.read!(Path.join([:code.priv_dir(:picape), "ah_graphql", "FetchMyListBasket.graphql"]))
  @fetch_my_list_basket_variables %{
    "input" => %{"sortType" => "TAXONOMY"},
    "states" => ["ACTIVATED", "ASSIGNED", "NONE", "REDEEMABLE"]
  }

  @update_my_list_basket "mutation UpdateMyListBasket($items: [BasketMutation!]!, $input: BasketInput) { basketItemsUpdate(items: $items, input: $input) { __typename status } }"

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

  def invalidate_product(product_id) do
    ConCache.delete(:supermarket, "product-#{product_id}")
  end

  def apply_changes(changes) do
    cart = cart()
    items = CartItems.apply_changes(changes, cart)

    case graphql!("UpdateMyListBasket", @update_my_list_basket, %{"input" => nil, "items" => items}) do
      %{
        status_code: 200,
        body: %{"data" => %{"basketItemsUpdate" => %{"status" => "SUCCESS"}}}
      } ->
        invalidate_cart()
        {:ok, :synced}

      other ->
        {:error, other}
    end
  end

  def cart() do
    ConCache.get_or_store(:supermarket, :cart, fn ->
      %{status_code: 200, body: %{"data" => %{"basket" => basket}}} =
        graphql!("FetchMyListBasket", @fetch_my_list_basket, @fetch_my_list_basket_variables)

      items =
        (basket["itemsInOrder"] || []) ++
          (basket["itemsInList"] || []) ++
          (basket["externalItems"] || [])

      %{"items" => items, "basket" => basket}
    end)
  end

  defp graphql!(operation_name, query, variables) do
    body = %{
      "operationName" => operation_name,
      "query" => query,
      "variables" => variables,
      "extensions" => @apollo_extensions
    }

    post!(@graphql_path, body,
      "Content-Type": "application/json",
      Accept: "multipart/mixed;deferSpec=20220824,application/graphql-response+json,application/json",
      "X-Accept-Language": "nl-NL",
      "X-GraphQL": "true"
    )
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
        "clientId" => "appie-ios"
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

  def image_url(%{"imagePack" => [_ | _] = pack}) do
    pack
    |> Enum.find_value(fn entry -> get_in(entry, ["medium", "url"]) end)
    |> case do
      nil -> "http://placekitten.com/64/64"
      url -> url
    end
  end

  def image_url(item) do
    case Enum.find(item["images"] || [], fn %{"width" => width} -> width >= 80 and width <= 150 end) do
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

  def process_response_status_code(status_code) do
    status_code |> IO.inspect(label: "129")
  end

  def process_request_url(url) do
    config(:base_url) <> url |> IO.inspect(label: "133")
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

  @user_agent_graphql "Appie/9.35 (iPhone17,1; iPhone; CPU OS 26_4_2 like Mac OS X)"
  @user_agent_auth "Appie/9.35 (nl.ah.Appie; build:260415110803; iOS 26.4.2) Alamofire/5.11.0"

  defp process_request_headers(headers) do
    is_refresh = Keyword.has_key?(headers, :"X-Refresh-Token")
    is_graphql = Keyword.has_key?(headers, :"X-GraphQL")

    headers
    |> Keyword.delete(:"X-Refresh-Token")
    |> Keyword.delete(:"X-GraphQL")
    |> add_defaults(config(:headers) || [])
    |> Keyword.put(:"User-Agent", default_user_agent(is_refresh, is_graphql))
    |> Keyword.put_new(:Accept, "*/*")
    |> Keyword.put_new(:"X-Correlation-Id", "/zoeken/producten-#{Ecto.UUID.generate() |> String.upcase()}")
    |> maybe_add_authorization_bearer(is_refresh)
  end

  defp add_defaults(headers, defaults) do
    Enum.reduce(defaults, headers, fn {k, v}, acc -> Keyword.put_new(acc, k, v) end)
  end

  defp default_user_agent(true, _graphql?), do: @user_agent_auth
  defp default_user_agent(false, true), do: @user_agent_graphql
  defp default_user_agent(false, false), do: @user_agent_graphql

  defp maybe_add_authorization_bearer(headers, true), do: headers

  defp maybe_add_authorization_bearer(headers, false) do
    Keyword.put(headers, :Authorization, "Bearer #{KeepLogin.get_access_token()}")
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
