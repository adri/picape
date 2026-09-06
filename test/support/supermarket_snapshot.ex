defmodule Picape.SupermarketSnapshot do
  @moduledoc """
  Records trimmed supermarket API responses into test/fixtures/supermarket.
  Picape.SupermarketFake serves these files in tests and in the local fake stack.

  Run it from the dev environment against the live API: bin/supermarket-snapshot
  """
  alias Picape.Supermarket

  @dir Path.expand("../fixtures/supermarket", __DIR__)
  @search_query "melk"
  @items_per_list 4

  def run do
    File.mkdir_p!(@dir)

    cart = Supermarket.cart()
    basket = trim_basket(cart["basket"])
    write("basket.json", %{"data" => %{"basket" => basket, "order" => trim_order(cart["order"])}})

    search =
      Supermarket.get!("/mobile-services/product/search/v2?page=0&query=#{@search_query}&sortOn=RELEVANCE").body

    write("search.json", Map.update(search, "products", [], &Enum.take(&1, @items_per_list)))

    basket
    |> product_ids()
    |> Enum.take(2)
    |> Enum.each(fn id -> write("product_#{id}.json", Supermarket.products_by_id(id)) end)
  end

  defp trim_basket(basket) do
    basket
    |> Map.put("notes", [])
    |> Map.update("itemsInOrder", [], &Enum.take(&1, @items_per_list))
    |> Map.update("itemsInList", [], &Enum.take(&1, @items_per_list))
    |> Map.update("externalItems", [], &Enum.take(&1, @items_per_list))
  end

  # The fixtures are committed to a public repository, and the delivery carries
  # the home address and the order id. Nothing here reads them.
  defp trim_order(order) when is_map(order) do
    update_in(order, ["delivery"], fn
      delivery when is_map(delivery) ->
        Map.merge(delivery, %{"address" => nil, "id" => nil, "shiftCode" => nil, "pickupLocationId" => nil})

      other ->
        other
    end)
  end

  defp trim_order(order), do: order

  defp product_ids(basket) do
    ((basket["itemsInOrder"] || []) ++ (basket["itemsInList"] || []))
    |> Enum.map(&get_in(&1, ["product", "id"]))
    |> Enum.reject(&is_nil/1)
  end

  defp write(name, data) do
    File.write!(Path.join(@dir, name), Jason.encode!(data, pretty: true))
    IO.puts("wrote test/fixtures/supermarket/#{name}")
  end
end
