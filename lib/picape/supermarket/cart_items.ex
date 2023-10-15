defmodule Picape.Supermarket.CartItems do
  @doc """
  Converts cart items structure to a structure that can be
  posted.
  """
  def from_supermarket_items(cart) do
    cart.items
    |> Enum.map(&convert_supermarket_cart_item(&1.id, &1.quantity, &1.name))
  end

  def apply_changes(changes, get_product_description) do
    []
    |> add_changes(changes.add, get_product_description)
    |> remove_changes(changes.remove, get_product_description)
  end

  defp convert_supermarket_cart_item(id, quantity, title) do
    %{
      "productId" => id,
      "quantity" => quantity,
      "strikedthrough" => false,
      "originCode" => "PRD",
      "description" => title
    }
  end

  defp add_changes(items, [], _get_product_description), do: items

  defp add_changes(items, changes, get_product_description) do
    changes
    |> Enum.map(fn change ->
      convert_supermarket_cart_item(change.id, change.quantity, get_product_description.(change.id))
    end)
    |> Enum.concat(items)
  end

  defp remove_changes(items, [], _get_product_description), do: items

  defp remove_changes(items, changes, get_product_description) do
    changes
    |> Enum.map(fn change ->
      convert_supermarket_cart_item(change.id, change.quantity, get_product_description.(change.id))
    end)
    |> Enum.concat(items)
  end
end
