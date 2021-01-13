defmodule Picape.Supermarket.CartItems do
  @doc """
  Converts cart items structure to a structure that can be
  posted.
  """
  def from_supermarket_cart(cart) do
    cart["orderedProducts"]
    |> Enum.map(&convert_supermarket_cart_item(&1["product"]["webshopId"], &1["amount"], &1["product"]["title"]))
  end

  def apply_changes(changes, get_product_description) do
    []
    |> add_items(changes.add, get_product_description)
    |> modify_items(changes.modify, get_product_description)
    |> remove_items(changes.remove, get_product_description)
  end

  defp convert_supermarket_cart_item(id, quantity, title) do
    %{
      "productIdtemId" => id,
      "quantity" => quantity,
      "strikedthrough" => false,
      "originCode" => "PRD",
      "description" => title
    }
  end

  defp add_items(items, changes, get_product_description) do
    changes
    |> Enum.map(fn change ->
      convert_supermarket_cart_item(change.id, change.quantity, get_product_description.(change.id))
    end)
    |> Enum.concat(items)
  end

  defp remove_items(items, changes, get_product_description) do
    changes
    |> Enum.map(fn change ->
      convert_supermarket_cart_item(change.id, -1, get_product_description.(change.id))
    end)
    |> Enum.concat(items)
  end

  defp modify_items(items, [], _get_product_description), do: items

  defp modify_items(items, changes, get_product_description) do
    changes
    |> Enum.map(fn change ->
      convert_supermarket_cart_item(change.id, change.quantity, get_product_description.(change.id))
    end)
    |> Enum.concat(items)
  end
end
