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

  plug(Plug.Parsers, parsers: [:json], json_decoder: Jason)
  plug(:match)
  plug(:dispatch)

  def start(port) do
    {:ok, _} = Agent.start_link(fn -> fixture("basket.json") end, name: @state)
    {:ok, _} = Agent.start_link(fn -> MapSet.new() end, name: @activations)
    Plug.Cowboy.http(__MODULE__, [], port: port)
  end

  @doc "Restores the basket to basket.json and drops the cached copy Picape keeps."

  def reset do
    reset_basket()
    Picape.Supermarket.invalidate_cart()
    Picape.Bonus.invalidate()
  end

  def reset_basket do
    Agent.update(@state, fn _ -> fixture("basket.json") end)
    Agent.update(@activations, fn _ -> MapSet.new() end)
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
