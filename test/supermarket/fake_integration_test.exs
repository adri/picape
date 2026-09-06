defmodule Picape.Supermarket.FakeIntegrationTest do
  use Picape.DataCase

  alias Picape.Order
  alias Picape.Order.Line
  alias Picape.Supermarket

  test "the current order comes from the fake basket" do
    {:ok, %Line{} = line} = Order.current()

    assert length(line.items) == 4
    assert line.total_count == 5
    assert line.total_price == 1879
    assert line.total_discount == 216

    assert Enum.map(line.items, & &1.name) == [
             "Roomboter ongezouten",
             "Kipfilet",
             "Parmigiano reggiano",
             "Zilvervliesrijst"
           ]

    assert Enum.all?(line.items, &String.starts_with?(&1.image_url, "https://static.supermarket.test/"))
  end

  test "search keeps only products that are available online" do
    results = Supermarket.search("melk")

    assert Enum.map(results, & &1.name) == ["Roomboter ongezouten", "Rundergehakt"]
    assert Enum.map(results, & &1.id) == [10_567_923, 10_281_999]
  end

  test "product details fall back to a recorded product for unknown ids" do
    assert get_in(Supermarket.products_by_id(10_567_923), ["productCard", "title"]) ==
             "Flower Farm Bakken zonder palm"

    assert get_in(Supermarket.products_by_id(1), ["productCard", "title"]) != nil
  end

  test "applying changes reports a synced cart" do
    changes = %Order.Sync.Changes{add: [%Order.Product{id: 10_583_837, quantity: 2}], remove: []}

    assert {:ok, :synced} = Supermarket.apply_changes(changes)
  end
end
