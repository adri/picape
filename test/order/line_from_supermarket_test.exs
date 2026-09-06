defmodule Picape.Order.LineFromSupermarketTest do
  use ExUnit.Case, async: true

  alias Picape.Order.LineFromSupermarket

  @cart %{"items" => [], "basket" => %{}}

  test "it reads the delivery slot off the order" do
    order = %{
      "delivery" => %{"date" => "2026-09-09", "startTime" => "08:00:00", "endTime" => "12:00:00"}
    }

    line = LineFromSupermarket.convert(Map.put(@cart, "order", order))

    assert line.delivery_date == "2026-09-09"
    assert line.delivery_start_time == "08:00:00"
    assert line.delivery_end_time == "12:00:00"
  end

  test "it leaves the slot empty when no delivery is booked" do
    line = LineFromSupermarket.convert(Map.put(@cart, "order", %{"delivery" => nil}))

    assert line.delivery_date == nil
    assert line.delivery_start_time == nil
    assert line.delivery_end_time == nil
  end

  test "it leaves the slot empty when the basket carries no order" do
    line = LineFromSupermarket.convert(Map.put(@cart, "order", nil))

    assert line.delivery_date == nil
  end

  test "it leaves the slot empty when the response has no order at all" do
    line = LineFromSupermarket.convert(@cart)

    assert line.delivery_date == nil
  end
end
