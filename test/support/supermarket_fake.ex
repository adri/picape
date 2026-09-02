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

  plug(Plug.Parsers, parsers: [:json], json_decoder: Jason)
  plug(:match)
  plug(:dispatch)

  def start(port) do
    {:ok, _} = Agent.start_link(fn -> fixture("basket.json") end, name: @state)
    Plug.Cowboy.http(__MODULE__, [], port: port)
  end

  @doc "Restores the basket to basket.json and drops Picape's cached copy of it."
  def reset do
    Agent.update(@state, fn _ -> fixture("basket.json") end)
    Picape.Supermarket.invalidate_cart()
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

      %{"operationName" => other} ->
        send_resp(conn, 400, "no fixture for GraphQL operation #{inspect(other)}")
    end
  end

  post "/__reset" do
    reset()
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
