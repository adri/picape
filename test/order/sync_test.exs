defmodule Picape.Order.SyncTest do
  use ExUnit.Case

  alias Picape.Order.{Sync}
  import Picape.Factory, only: [build: 2, build: 1]

  test "no changes for empty lists" do
    assert {:ok, build(:sync_changes)} == Sync.sync(%{}, %{}, %{})
  end

  test "merges products for planned and manual lists" do
    planned = build(:product_map, %{
      "123": 1,
      "1234": 1,
    })
    manual = build(:product_map, %{
      "12345": 1,
    })
    changes = build(:sync_changes,
      add: [
        build(:product, id: "12345"),
        build(:product, id: "1234"),
        build(:product, id: "123"),
      ]
    )

    assert {:ok, changes} == Sync.sync(planned, manual, %{})
  end

  test "sums product quantities for planned and manual lists" do
    planned = build(:product_map, %{
      "sum_up": 1,
      "other": 1,
    })
    manual = build(:product_map, %{
      "sum_up": 2,
    })
    changes = build(:sync_changes,
      add: [
        build(:product, id: "sum_up", quantity: 3),
        build(:product, id: "other"),
      ]
    )

    assert {:ok, changes} == Sync.sync(planned, manual, %{})
  end

  test "ignores existing product with equal quantity" do
    planned = build(:product_map, %{
      "existing": 1,
      "other": 1,
    })
    existing = build(:product_map, %{
      "existing": 1,
    })
    changes = build(:sync_changes,
      add: [
        build(:product, id: "other"),
      ],
    )

    assert {:ok, changes} == Sync.sync(planned, %{}, existing)
  end

  test "adds one additional product to one existing to match 2 in total" do
    planned = build(:product_map, %{
      "existing": 1
    })
    manual = build(:product_map, %{
      "existing": 1
    })
    existing = build(:product_map, %{
      "existing": 1,
    })
    changes = build(:sync_changes,
      add: [
        build(:product, id: "existing", quantity: 1),
      ]
    )

    assert {:ok, changes} == Sync.sync(planned, manual, existing)
  end

  test "adds two additional products to one existing to match 3 in total" do
    planned = build(:product_map, %{
      "existing": 1
    })
    manual = build(:product_map, %{
      "existing": 2
    })
    existing = build(:product_map, %{
      "existing": 1,
    })
    changes = build(:sync_changes,
      add: [
        build(:product, id: "existing", quantity: 2),
      ]
    )

    assert {:ok, changes} == Sync.sync(planned, manual, existing)
  end

  test "removes one product with two existing" do
    manual = build(:product_map, %{
      "existing": 1
    })
    existing = build(:product_map, %{
      "existing": 2,
    })
    changes = build(:sync_changes,
      remove: [
        build(:product, id: "existing", quantity: 1),
      ]
    )

    assert {:ok, changes} == Sync.sync(%{}, manual, existing)
  end

  test "removes 7 products to match 3 with 10 existing" do
    manual = build(:product_map, %{
      "existing": 3
    })
    existing = build(:product_map, %{
      "existing": 10,
    })
    changes = build(:sync_changes,
      remove: [
        build(:product, id: "existing", quantity: 7),
      ]
    )

    assert {:ok, changes} == Sync.sync(%{}, manual, existing)
  end

  test "doesn't remove existing product" do
    existing = build(:product_map,  %{
      "existing": 1,
    })

    assert {:ok, build(:sync_changes)} == Sync.sync(%{}, %{}, existing)
  end

  test "remove existing product" do
    manual = build(:product_map,  %{
      "existing": 0,
    })
    existing = build(:product_map,  %{
      "existing": 1,
    })
    changes = build(:sync_changes,
      remove: [
        build(:product, id: "existing", quantity: 1),
      ]
    )

    assert {:ok, changes} == Sync.sync(%{}, manual, existing)
  end

  test "manual quantities can never be negative" do
    manual = build(:product_map,  %{
      "existing": -1,
    })

    assert {:error, :negative_quantity} == Sync.sync(%{}, manual, %{})
  end

  test "planned quantities can never be negative" do
    planned = build(:product_map,  %{
      "existing": -1,
    })

    assert {:error, :negative_quantity} == Sync.sync(planned, %{}, %{})
  end
end
