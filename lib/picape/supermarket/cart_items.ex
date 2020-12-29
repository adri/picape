defmodule Picape.Supermarket.CartItems do
  @spec from_supermarket_cart(nil | maybe_improper_list | map) :: [any]
  @doc """
  Converts cart items structure to a structure that can be
  posted.
  """
  def from_supermarket_cart(cart) do
    cart["items"]
    |> Enum.map(&convert_supermarket_cart_item(&1["product"]["webshopId"], &1["quantity"], &1["product"]["title"]))
  end

  def apply_changes(items, changes, get_product_description) do
    items
    |> add_items(changes.add, get_product_description)
    |> modify_items(changes.modify)
    |> remove_items(changes.remove)
    |> renumber()
  end

  defp convert_supermarket_cart_item(id, quantity, title) do
    %{
      "itemId" => "wi#{id}",
      "quantity" => quantity,
      "strikedthrough" => false,
      "sourceCode" => "PRD",
      "description" => title,
      "type" => "shoppable"
    }
  end

  defp add_items(items, changes, get_product_description) do
    changes
    |> Enum.map(fn change ->
      convert_supermarket_cart_item(change.id, change.quantity, get_product_description.(change.id))
    end)
    |> Enum.concat(items)
  end

  defp remove_items(items, changes) do
    ids = changes |> Enum.map(fn change -> to_string(change.id) end)

    items
    |> Enum.filter(fn %{"itemId" => "wi" <> id} -> not Enum.member?(ids, id) end)
  end

  defp modify_items(items, []), do: items

  defp modify_items(items, changes) do
    quantity = for change <- changes, into: %{}, do: {to_string(change.id), change.quantity}

    items
    |> Enum.map(fn %{"itemId" => "wi" <> id} = item ->
      (Map.has_key?(quantity, id) && put_in(item["quantity"], quantity[id])) || item
    end)
  end

  defp renumber(items) do
    items
    |> Enum.with_index()
    |> Enum.map(fn {item, i} ->
      item
      |> put_in(["position"], i)
      |> put_in(["listItemId"], i + 1)
    end)
  end
end
