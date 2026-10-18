defmodule Picape.Picnic do
  @moduledoc """
  HTTP client for Picnic's `api/15` endpoints. Covers only what picnic mode
  needs: search, the cart, and adding or removing products in it.

  There is no checkout, payment or delivery-slot endpoint here on purpose.
  Orders are always finished in the Picnic app itself; Picape only keeps the
  cart in step with the plan.

  Auth is an auth key sent as the `x-picnic-auth` header on every request.
  `login/2` trades a username and password for one; the key itself is
  configured with `PICNIC_AUTH_KEY`, the same way the supermarket's secrets
  come from env vars.
  """
  use HTTPoison.Base

  alias Picape.Picnic.SearchResult

  @default_base_url "https://storefront-prod.nl.picnicinternational.com/api/15"

  def search(""), do: []

  def search(query) do
    get!("/pages/search-page-results?search_term=#{Plug.Conn.Query.encode(query)}").body
    |> SearchResult.from_result()
  end

  def cart() do
    ConCache.get_or_store(:supermarket, :picnic_cart, fn ->
      get!("/cart").body
    end)
  end

  @doc """
  Adds `count` of a selling unit to the cart. The answer is the whole cart,
  so it refreshes the cached copy instead of needing another read.
  """
  def add_product(product_id, count \\ 1) do
    %{"product_id" => product_id, "count" => count}
    |> post_cart("/cart/add_product")
  end

  @doc "Removes `count` of a selling unit from the cart."
  def remove_product(product_id, count \\ 1) do
    %{"product_id" => product_id, "count" => count}
    |> post_cart("/cart/remove_product")
  end

  @doc """
  Pushes an `Order.Sync.Changes` diff into the Picnic cart. `existing` maps
  each Picnic product id to its current cart quantity: Picnic's mutations are
  deltas, not absolute quantities, so each change becomes an add or remove of
  the difference. Products in the cart that the diff does not name are left
  alone.
  """
  def apply_changes(changes, existing) do
    Enum.each(changes.remove, fn %{id: id, quantity: quantity} ->
      remove_product(id, (existing[id] || 0) - quantity)
    end)

    Enum.each(changes.add, fn %{id: id, quantity: quantity} ->
      add_product(id, quantity - (existing[id] || 0))
    end)

    {:ok, :synced}
  end

  @doc """
  Trades account credentials for an auth key, the `x-picnic-auth` value every
  other call needs. Meant to be run by hand to bootstrap `PICNIC_AUTH_KEY`;
  the app never calls it. Picnic may answer that a second factor is required,
  in which case this returns `{:error, :second_factor_required}`.
  """
  def login(username, password) do
    secret = :crypto.hash(:md5, password) |> Base.encode16(case: :lower)

    response =
      post!("/user/login", %{"key" => username, "secret" => secret, "client_id" => 30_100})

    case List.keyfind(response.headers, "x-picnic-auth", 0) do
      {_, auth_key} -> {:ok, auth_key}
      nil -> {:error, :second_factor_required}
    end
  end

  def invalidate_cart() do
    ConCache.delete(:supermarket, :picnic_cart)
  end

  def image_url(image_id) when is_binary(image_id) do
    static_base_url() <> "/static/images/" <> image_id <> "/small.png"
  end

  def image_url(_), do: "http://placekitten.com/64/64"

  # ---

  defp post_cart(body, path) do
    cart = post!(path, body, "Content-Type": "application/json").body
    ConCache.put(:supermarket, :picnic_cart, cart)
    cart
  end

  defp static_base_url() do
    (config(:base_url) || @default_base_url) |> String.replace(~r|/api/.*$|, "")
  end

  def process_response_status_code(status_code) do
    status_code |> IO.inspect(label: "129")
  end

  def process_request_url(url) do
    ((config(:base_url) || @default_base_url) <> url) |> IO.inspect(label: "133")
  end

  def process_response_body(body) do
    case Poison.decode(body) do
      {:ok, value} -> value
      {:error, _} -> body
    end
  end

  def process_response(%HTTPoison.Response{body: body, status_code: status_code} = response) do
    if is_binary(body) do
      raise Picape.Supermarket.Error,
        message:
          "Picnic answered HTTP #{status_code} with a non-JSON body: " <>
            String.slice(body, 0, 200)
    else
      response
    end
  end

  def process_request_headers(headers) do
    headers
    |> Keyword.put_new(:Accept, "*/*")
    |> Keyword.put_new(:"Accept-Language", "nl-NL")
    |> Keyword.put_new(:"User-Agent", config(:user_agent) || "Picape")
    |> Keyword.put_new(:"x-picnic-agent", config(:agent) || "")
    |> Keyword.put_new(:"x-picnic-did", config(:did) || "")
    |> put_auth_key()
  end

  defp put_auth_key(headers) do
    case config(:auth_key) do
      nil -> headers
      auth_key -> Keyword.put(headers, :"x-picnic-auth", auth_key)
    end
  end

  def process_request_body(""), do: ""

  def process_request_body(body) do
    Poison.encode!(body)
  end

  def process_request_options(options) do
    Keyword.merge(options, hackney: config(:hackney) || [])
  end

  defp config(key) do
    Application.get_env(:picape, __MODULE__, [])[key]
  end
end
