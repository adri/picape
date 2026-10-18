defmodule Picape.SupermarketFake do
  @moduledoc """
  Stands in for the supermarket API using the fixtures in test/fixtures/supermarket.
  The basket starts from basket.json and follows UpdateMyListBasket mutations,
  so planning and ordering flows behave like the real cart.

  Tests hit it on :4021 (see test/test_helper.exs). The local fake stack runs it
  on :4020 through bin/supermarket-fake and points Phoenix at it with SUPERMARKET_BASE_URL.
  """
  use Plug.Router

  @dir Path.expand("../fixtures/supermarket", __DIR__)
  @state __MODULE__.State
  @activations __MODULE__.Activations
  @orders __MODULE__.Orders
  @picnic __MODULE__.Picnic
  @down __MODULE__.Down
  @picnic_auth_error __MODULE__.PicnicAuthError
  @requests __MODULE__.Requests

  plug(Plug.Parsers, parsers: [:json], json_decoder: Jason)
  plug(:maybe_down)
  plug(:maybe_picnic_auth_error)
  plug(:log_request)
  plug(:match)
  plug(:dispatch)

  def start(port) do
    {:ok, _} = Agent.start_link(fn -> fixture("basket.json") end, name: @state)
    {:ok, _} = Agent.start_link(fn -> MapSet.new() end, name: @activations)
    {:ok, _} = Agent.start_link(fn -> fixture("orders.json") end, name: @orders)
    {:ok, _} = Agent.start_link(fn -> fixture("picnic_cart.json") end, name: @picnic)
    {:ok, _} = Agent.start_link(fn -> false end, name: @down)
    {:ok, _} = Agent.start_link(fn -> false end, name: @picnic_auth_error)
    {:ok, _} = Agent.start_link(fn -> [] end, name: @requests)
    Plug.Cowboy.http(__MODULE__, [], port: port)
  end

  @doc "Restores the basket to basket.json and drops the cached copy Picape keeps."

  def reset do
    reset_basket()
    Picape.Supermarket.invalidate_cart()
    Picape.Supermarket.invalidate_orders()
    Picape.Bonus.invalidate()
  end

  def reset_basket do
    Agent.update(@state, fn _ -> fixture("basket.json") end)
    Agent.update(@activations, fn _ -> MapSet.new() end)
    Agent.update(@orders, fn _ -> fixture("orders.json") end)
    Agent.update(@picnic, fn _ -> fixture("picnic_cart.json") end)
    Agent.update(@down, fn _ -> false end)
    Agent.update(@picnic_auth_error, fn _ -> false end)
    Agent.update(@requests, fn _ -> [] end)
    Picape.Picnic.invalidate_cart()
  end

  @doc "Every request the fake answered, oldest first: method, path, query, body and headers."
  def requests(), do: Agent.get(@requests, &Enum.reverse/1)

  defp maybe_down(conn, _opts) do
    if Agent.get(@down, & &1) and not String.starts_with?(conn.request_path, "/__") do
      conn
      |> send_resp(503, "<html><body><h1>503 Service Unavailable</h1></body></html>")
      |> halt()
    else
      conn
    end
  end

  # Picnic rejects a request whose auth key it does not know with a 401 and an
  # error body; /__picnic_auth_error makes the api routes do that until reset.
  defp maybe_picnic_auth_error(conn, _opts) do
    if Agent.get(@picnic_auth_error, & &1) and String.starts_with?(conn.request_path, "/api/15/") do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(401, Jason.encode!(%{"error" => %{"code" => "AUTH_ERROR"}}))
      |> halt()
    else
      conn
    end
  end

  defp log_request(conn, _opts) do
    body =
      case conn.body_params do
        %Plug.Conn.Unfetched{} -> nil
        params -> params
      end

    Agent.update(@requests, fn requests ->
      [
        %{
          method: conn.method,
          path: conn.request_path,
          query: conn.query_string,
          body: body,
          headers: Map.new(conn.req_headers)
        }
        | requests
      ]
    end)

    conn
  end

  post "/graphql" do
    case conn.body_params do
      %{"operationName" => "FetchMyListBasket"} ->
        json(conn, Agent.get(@state, & &1))

      %{"operationName" => "UpdateMyListBasket", "variables" => %{"items" => items}} ->
        Agent.update(@state, &update_basket(&1, items))

        json(conn, %{
          "data" => %{"basketItemsUpdate" => %{"__typename" => "BasketMutationResult", "status" => "SUCCESS"}}
        })

      %{"operationName" => "FetchBonusBoxOffers"} ->
        json(conn, bonus_offers())

      %{"operationName" => "FetchBonusPromotionWithProducts", "variables" => %{"id" => id}} ->
        json(conn, fixture("bonus_products_#{id}.json") || no_products(id))

      %{"operationName" => "BonusActivatePersonalPromotion", "variables" => %{"externalId" => external_id}} ->
        json(conn, activate(external_id))

      %{"operationName" => other} ->
        send_resp(conn, 400, "no fixture for GraphQL operation #{inspect(other)}")
    end
  end

  post "/__reset" do
    reset_basket()
    send_resp(conn, 204, "")
  end

  # Pretends the order in the basket was paid: the summaries endpoint starts
  # reporting it as processing, so Picape freezes its side of the basket.
  post "/__place_order" do
    Agent.update(@orders, fn _ -> fixture("orders_placed.json") end)
    send_resp(conn, 204, "")
  end

  # Pretends that order was delivered: processing ends and Picape may sync again.
  post "/__deliver_order" do
    Agent.update(@orders, fn _ -> fixture("orders.json") end)
    send_resp(conn, 204, "")
  end

  # Pretends the whole API is down: every endpoint answers the HTML error page
  # a dead service returns, until /__up or /__reset. The __-routes stay up so a
  # test can always get the fake back.
  post "/__down" do
    Agent.update(@down, fn _ -> true end)
    send_resp(conn, 204, "")
  end

  # Pretends the Picnic auth key was rejected: every api/15 endpoint answers
  # 401 with an AUTH_ERROR body, until /__reset.
  post "/__picnic_auth_error" do
    Agent.update(@picnic_auth_error, fn _ -> true end)
    send_resp(conn, 204, "")
  end

  post "/__up" do
    Agent.update(@down, fn _ -> false end)
    send_resp(conn, 204, "")
  end

  # The Picnic api/15 endpoints picnic mode uses. `add_product` and
  # `remove_product` keep a basket the same way the basket fixture does:
  # product ids are selling unit ids like "s2001".
  get "/api/15/cart" do
    json(conn, Agent.get(@picnic, & &1))
  end

  post "/api/15/cart/add_product" do
    %{"product_id" => product_id, "count" => count} = conn.body_params
    json(conn, Agent.get_and_update(@picnic, &picnic_cart(&1, product_id, count)))
  end

  post "/api/15/cart/remove_product" do
    %{"product_id" => product_id, "count" => count} = conn.body_params
    json(conn, Agent.get_and_update(@picnic, &picnic_cart(&1, product_id, -count)))
  end

  get "/api/15/pages/search-page-results" do
    case conn.params["search_term"] do
      term when is_binary(term) and term != "" -> json(conn, fixture("picnic_search.json"))
      _ -> send_resp(conn, 400, "search_term is required")
    end
  end

  get "/mobile-services/v4/order/summaries" do
    json(conn, Agent.get(@orders, & &1))
  end

  get "/mobile-services/product/search/v2" do
    json(conn, fixture("search.json"))
  end

  get "/mobile-services/product/detail/v4/fir/:id" do
    json(conn, fixture("product_#{id}.json") || first_product())
  end

  post "/mobile-auth/v1/auth/token/refresh" do
    json(conn, %{"access_token" => "fake-access-token", "refresh_token" => "fake-refresh-token", "expires_in" => 3600})
  end

  match _ do
    send_resp(conn, 404, "no fixture for #{conn.method} #{conn.request_path}")
  end

  # The offer fixture is recorded before anything was activated, so the state an
  # earlier mutation left behind is written over it on the way out.
  defp bonus_offers do
    activated = Agent.get(@activations, & &1)

    update_in(fixture("bonus_offers.json"), ["data", "bonusPromotions"], fn promotions ->
      Enum.map(promotions, &activation_status(&1, activated))
    end)
  end

  defp activation_status(promotion, activated) do
    if MapSet.member?(activated, promotion["hqId"]),
      do: Map.put(promotion, "activationStatus", "ACTIVATED"),
      else: promotion
  end

  defp activate(external_id) do
    if known_offer?(external_id) do
      Agent.update(@activations, &MapSet.put(&1, external_id))
      bonus_activation_result("OFFER_ACTIVATED", "SUCCESS")
    else
      bonus_activation_result("OFFER_NOT_FOUND", "FAILURE")
    end
  end

  defp known_offer?(external_id) do
    fixture("bonus_offers.json")
    |> get_in(["data", "bonusPromotions"])
    |> Enum.any?(&(&1["hqId"] == external_id))
  end

  defp bonus_activation_result(message, status) do
    %{
      "data" => %{
        "bonusActivatePersonalPromotion" => %{
          "__typename" => "ActivatePersonalPromotionResponse",
          "message" => message,
          "status" => status
        }
      }
    }
  end

  defp no_products(id) do
    %{"data" => %{"bonusPromotions" => [%{"__typename" => "Promotion", "id" => id, "products" => []}]}}
  end

  # Picnic's cart is a list of ORDER_LINE groups, each holding ORDER_ARTICLEs
  # whose quantity lives in a QUANTITY decorator. A positive delta bumps or
  # appends, a negative one lowers and empties groups drop out.
  defp picnic_cart(cart, product_id, delta) do
    groups =
      cart["items"]
      |> Enum.map(&picnic_group_articles(&1, product_id, delta))
      |> Enum.reject(&(&1["items"] == []))

    groups =
      if delta > 0 and is_nil(picnic_article(cart, product_id)) do
        groups ++ [picnic_group(product_id, delta)]
      else
        groups
      end

    articles = Enum.flat_map(groups, & &1["items"])

    cart
    |> Map.put("items", groups)
    |> Map.put("total_count", articles |> Enum.map(&picnic_quantity/1) |> Enum.sum())
    |> Map.put("total_price", articles |> Enum.map(&(&1["price"] * picnic_quantity(&1))) |> Enum.sum())
    |> then(&{&1, &1})
  end

  defp picnic_group_articles(group, product_id, delta) do
    articles =
      Enum.flat_map(group["items"], fn
        %{"id" => ^product_id} = article ->
          quantity = picnic_quantity(article) + delta
          if quantity > 0, do: [picnic_quantity(article, quantity)], else: []

        article ->
          [article]
      end)

    %{group | "items" => articles}
  end

  defp picnic_article(cart, product_id) do
    cart["items"] |> Enum.flat_map(& &1["items"]) |> Enum.find(&(&1["id"] == product_id))
  end

  defp picnic_quantity(article) do
    Enum.find(article["decorators"], %{"quantity" => 0}, &(&1["type"] == "QUANTITY"))["quantity"]
  end

  defp picnic_quantity(article, quantity) do
    put_in(article["decorators"], [%{"type" => "QUANTITY", "quantity" => quantity}])
  end

  defp picnic_group(product_id, count) do
    unit =
      fixture("picnic_search.json")
      |> picnic_selling_units()
      |> Enum.find(&(&1["id"] == product_id)) || %{"id" => product_id, "name" => "Product #{product_id}"}

    %{
      "type" => "ORDER_LINE",
      "id" => "group_#{product_id}",
      "items" => [
        %{
          "type" => "ORDER_ARTICLE",
          "id" => product_id,
          "name" => unit["name"],
          "price" => unit["display_price"] || 0,
          "image_ids" => List.wrap(unit["image_id"]),
          "decorators" => [%{"type" => "QUANTITY", "quantity" => count}],
          "max_count" => unit["max_count"] || 50,
          "unit_quantity" => unit["unit_quantity"] || ""
        }
      ],
      "price" => (unit["display_price"] || 0) * count
    }
  end

  defp picnic_selling_units(node) when is_map(node) do
    Enum.flat_map(node, fn
      {"sellingUnit", %{} = unit} -> [unit | picnic_selling_units(unit)]
      {_key, value} -> picnic_selling_units(value)
    end)
  end

  defp picnic_selling_units(list) when is_list(list),
    do: Enum.flat_map(list, &picnic_selling_units/1)

  defp picnic_selling_units(_), do: []

  defp update_basket(response, items) do
    update_in(response, ["data", "basket"], fn basket ->
      basket = Enum.reduce(items, basket, &apply_item/2)
      quantity = basket |> all_items() |> Enum.map(& &1["quantity"]) |> Enum.sum()
      put_in(basket, ["summary", "quantity"], quantity)
    end)
  end

  defp apply_item(%{"id" => id, "quantity" => quantity, "newPosition" => position}, basket) do
    product = basket |> all_items() |> Enum.find_value(&(same_id?(&1, id) && &1["product"])) || product_stub(id)

    basket =
      basket
      |> Map.update("itemsInOrder", [], &reject_product(&1, id))
      |> Map.update("itemsInList", [], &reject_product(&1, id))

    if quantity > 0 do
      item = %{
        "__typename" => "BasketListItem",
        "position" => position,
        "originCode" => "MANUAL",
        "isStrikethrough" => false,
        "quantity" => quantity,
        "product" => product
      }

      Map.update(basket, "itemsInList", [item], &(&1 ++ [item]))
    else
      basket
    end
  end

  defp all_items(basket) do
    (basket["itemsInOrder"] || []) ++ (basket["itemsInList"] || []) ++ (basket["externalItems"] || [])
  end

  defp reject_product(items, id), do: Enum.reject(items, &same_id?(&1, id))

  defp same_id?(item, id), do: to_string(get_in(item, ["product", "id"])) == to_string(id)

  defp product_stub(id) do
    card = get_in(fixture("product_#{id}.json") || %{}, ["productCard"]) || %{}

    %{
      "__typename" => "Product",
      "id" => id,
      "title" => card["title"] || "Product #{id}",
      "imagePack" => [],
      "images" => card["images"] || []
    }
  end

  defp fixture(name) do
    case File.read(Path.join(@dir, name)) do
      {:ok, body} -> Jason.decode!(body)
      {:error, _} -> nil
    end
  end

  defp first_product do
    @dir |> Path.join("product_*.json") |> Path.wildcard() |> List.first() |> Path.basename() |> fixture()
  end

  defp json(conn, data) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(data))
  end
end
