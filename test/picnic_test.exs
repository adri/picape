defmodule Picape.PicnicTest do
  use Picape.DataCase

  alias Picape.Order.Sync
  alias Picape.{Picnic, SupermarketFake}

  test "search returns the selling units the page carries" do
    assert [
             %{id: "s2001", name: "Volkoren brood", price: 189, unit_quantity: "800 g"},
             %{id: "s2002", name: "Halfvolle melk", price: 119, unit_quantity: "1 l"}
           ] = Picnic.search("brood")
  end

  test "search sends the query as search_term" do
    Picnic.search("volkoren brood")

    request = List.last(SupermarketFake.requests())
    assert request.method == "GET"
    assert request.path == "/api/15/pages/search-page-results"
    assert request.query == "search_term=volkoren+brood"
  end

  test "the fake refuses a search without search_term" do
    assert %HTTPoison.Response{status_code: 400} =
             HTTPoison.get!("http://localhost:4021/api/15/pages/search-page-results")
  end

  test "every request carries the Picnic headers" do
    Picnic.cart()

    request = List.last(SupermarketFake.requests())
    assert request.headers["x-picnic-auth"] == "test-auth-key"
    assert is_binary(request.headers["x-picnic-agent"]) and request.headers["x-picnic-agent"] != ""
    assert is_binary(request.headers["x-picnic-did"]) and request.headers["x-picnic-did"] != ""
    assert request.headers["x-picnic-country"] == "NL"
  end

  test "search with an empty query asks nothing" do
    assert Picnic.search("") == []
  end

  test "cart reads the order Picnic reports" do
    cart = Picnic.cart()

    assert cart["total_count"] == 1
    assert cart["total_price"] == 189
    assert picnic_quantity(cart, "s2001") == 1
  end

  test "add_product and remove_product move selling units in and out" do
    cart = Picnic.add_product("s2002", 3)
    assert picnic_quantity(cart, "s2002") == 3

    cart = Picnic.remove_product("s2002", 1)
    assert picnic_quantity(cart, "s2002") == 2

    cart = Picnic.remove_product("s2002", 2)
    assert picnic_article(cart, "s2002") == nil
  end

  test "add_product returns and caches the whole cart" do
    cart = Picnic.add_product("s2002", 1)

    assert Picnic.cart() == cart
  end

  test "apply_changes posts the deltas a target-quantity diff asks for" do
    {:ok, changes} = Sync.changes(%{"s2001" => 3, "s2002" => 1}, %{}, %{"s2001" => 1})

    assert {:ok, :synced} = Picnic.apply_changes(changes, %{"s2001" => 1})

    cart = Picnic.cart()
    assert picnic_quantity(cart, "s2001") == 3
    assert picnic_quantity(cart, "s2002") == 1
  end

  test "apply_changes removes down to the wanted quantity" do
    {:ok, changes} = Sync.changes(%{}, %{"s2001" => 0}, %{"s2001" => 1})

    assert {:ok, :synced} = Picnic.apply_changes(changes, %{"s2001" => 1})

    assert picnic_article(Picnic.cart(), "s2001") == nil
  end

  test "login trades credentials for the auth key header" do
    assert {:ok, "test-auth-key"} = Picnic.login("user@example.com", "secret")
  end

  test "a 2FA login returns the provisional key the verify calls need" do
    assert {:error, {:second_factor_required, "provisional-auth-key"}} =
             Picnic.login("needs-2fa", "secret")

    assert :ok = Picnic.generate_2fa("provisional-auth-key")
    assert :ok = Picnic.verify_2fa("provisional-auth-key", "123456")

    [verify, generate] = SupermarketFake.requests() |> Enum.take(-2) |> Enum.reverse()
    assert generate.path == "/api/15/user/2fa/generate"
    assert generate.body == %{"channel" => "SMS"}
    assert generate.headers["x-picnic-auth"] == "provisional-auth-key"
    assert verify.path == "/api/15/user/2fa/verify"
    assert verify.body == %{"otp" => "123456"}
    assert verify.headers["x-picnic-auth"] == "provisional-auth-key"
  end

  test "a wrong 2FA code raises the shared supermarket error" do
    error =
      assert_raise Picape.Supermarket.Error, fn ->
        Picnic.verify_2fa("provisional-auth-key", "000000")
      end

    assert error.message =~ "TWO_FACTOR_AUTHENTICATION_ERROR"
  end

  test "a dead Picnic raises the shared supermarket error" do
    HTTPoison.post!("http://localhost:4021/__down", "")
    Picnic.invalidate_cart()

    error = assert_raise Picape.Supermarket.Error, fn -> Picnic.cart() end
    assert error.message =~ "503"
  end

  test "a rejected auth key raises the shared supermarket error" do
    HTTPoison.post!("http://localhost:4021/__picnic_auth_error", "")
    Picnic.invalidate_cart()

    error = assert_raise Picape.Supermarket.Error, fn -> Picnic.cart() end
    assert error.message =~ "401"
    assert error.message =~ "AUTH_ERROR"
  end

  test "without an auth key the client refuses before it asks" do
    key = Application.get_env(:picape, Picape.Picnic)[:auth_key]
    Application.put_env(:picape, Picape.Picnic, base_url: "http://localhost:4021/api/15")

    on_exit(fn ->
      Application.put_env(:picape, Picape.Picnic, base_url: "http://localhost:4021/api/15", auth_key: key)
    end)

    error = assert_raise Picape.Supermarket.Error, fn -> Picnic.cart() end
    assert error.message =~ "PICNIC_AUTH_KEY"
  end

  defp picnic_article(cart, product_id) do
    cart["items"]
    |> Enum.flat_map(& &1["items"])
    |> Enum.find(&(&1["id"] == product_id))
  end

  defp picnic_quantity(cart, product_id) do
    case picnic_article(cart, product_id) do
      nil -> nil
      article -> Enum.find(article["decorators"], &(&1["type"] == "QUANTITY"))["quantity"]
    end
  end
end
