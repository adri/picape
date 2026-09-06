defmodule Picape.MCPTest do
  use PicapeWeb.ConnCase

  import Ecto.Query
  import Picape.Factory

  alias Picape.Order
  alias Picape.Recipe
  alias Picape.Recipe.Ingredient
  alias Picape.Recipe.IngredientRef
  alias Picape.Repo

  describe "protocol" do
    test "initialize announces the tool capability" do
      assert %{"result" => result} = request("initialize")

      assert result["capabilities"] == %{"tools" => %{}}
      assert result["serverInfo"]["name"] == "picape"
    end

    test "tools/list describes every tool" do
      assert %{"result" => %{"tools" => tools}} = request("tools/list")

      assert Enum.map(tools, & &1["name"]) == [
               "search_ingredients",
               "search_supermarket",
               "get_shopping_list",
               "set_ingredient_quantity",
               "add_ingredient",
               "list_recipes",
               "get_recipe",
               "add_recipe",
               "edit_recipe",
               "plan_recipe",
               "unplan_recipe"
             ]

      assert Enum.all?(tools, &(&1["inputSchema"]["type"] == "object"))
      assert Enum.all?(tools, &(String.length(&1["description"]) > 0))
    end

    test "a notification is accepted without a reply" do
      conn = post_mcp(~s({"jsonrpc":"2.0","method":"notifications/initialized"}))

      assert response(conn, 202) == ""
    end

    test "a broken body is a bad request" do
      error = assert_raise Plug.Parsers.ParseError, fn -> post_mcp("not json") end

      assert Plug.Exception.status(error) == 400
    end

    test "an unknown method is a method-not-found error" do
      assert %{"error" => %{"code" => -32_601, "message" => "unknown method resources/list"}} =
               request("resources/list")
    end

    test "an unknown tool is an invalid-params error" do
      assert %{"error" => %{"code" => -32_602}} = request("tools/call", %{name: "eat_recipe", arguments: %{}})
    end

    test "a request from a browser is refused whatever its origin" do
      conn =
        build_conn()
        |> put_req_header("origin", "https://evil.example")
        |> post_mcp(~s({"jsonrpc":"2.0","id":1,"method":"tools/list"}))

      assert json_response(conn, 403)["error"]["message"] == "origin not allowed"
    end

    test "the endpoint takes POST only" do
      assert response(get(build_conn(), "/mcp"), 405) == ""
      assert response(delete(build_conn(), "/mcp"), 405) == ""
    end
  end

  describe "search_ingredients" do
    test "matches on part of the name and can exclude ingredients" do
      insert!(:ingredient, name: "Bloem")
      insert!(:ingredient, name: "Melk")
      other_bloem = insert!(:ingredient, name: "Bloemkool")

      assert [%{"name" => "Bloem"}, %{"name" => "Bloemkool"}] = call!("search_ingredients", %{query: "bloem"})

      assert [%{"name" => "Bloem"}] =
               call!("search_ingredients", %{query: "bloem", exclude_ids: [other_bloem.id]})
    end
  end

  describe "search_supermarket" do
    test "returns products from the catalogue" do
      assert [%{"name" => "Roomboter ongezouten", "id" => 10_567_923} | _] =
               call!("search_supermarket", %{query: "melk"})
    end
  end

  describe "get_shopping_list" do
    test "returns the cart and links items to known ingredients" do
      insert!(:ingredient, name: "Roomboter", supermarket_product_id: 10_567_923)

      # In cents. The supermarket sends euros as floats and the cart used to
      # truncate them, so this was 12 for a basket of 12.86.
      assert %{"total_count" => 4, "total_price" => 1286, "items" => items} = call!("get_shopping_list")

      assert %{"name" => "Roomboter ongezouten", "quantity" => 1, "ingredient" => %{"name" => "Roomboter"}} =
               Enum.find(items, &(&1["name"] == "Roomboter ongezouten"))

      assert Enum.find(items, &(&1["name"] == "Kipfilet"))["ingredient"] == nil
    end

    test "names the recipes that asked for an item" do
      ingredient = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)
      recipe = insert!(:recipe, title: "Nasi", ingredients: [ingredient])
      insert!(:planned_recipe, recipe_id: recipe.id)

      list = call!("get_shopping_list")
      item = Enum.find(list["items"], &(&1["name"] == "Zilvervliesrijst"))

      assert item["ingredient"]["planned_recipes"] == [
               %{"quantity" => 1, "recipe_id" => recipe.id, "title" => "Nasi"}
             ]
    end
  end

  describe "set_ingredient_quantity" do
    test "records a manual override for the order" do
      ingredient = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)

      assert %{"id" => id} = call!("set_ingredient_quantity", %{ingredient_id: ingredient.id, quantity: 3})
      assert id == ingredient.id

      assert Order.manual_ingredients("1") == {:ok, %{10_583_837 => 3}}
    end

    test "quantity 0 takes the ingredient off the list" do
      ingredient = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)

      call!("set_ingredient_quantity", %{ingredient_id: ingredient.id, quantity: 3})
      call!("set_ingredient_quantity", %{ingredient_id: ingredient.id, quantity: 0})

      assert Order.manual_ingredients("1") == {:ok, %{10_583_837 => 0}}
    end

    test "reports an unknown ingredient" do
      assert call_error("set_ingredient_quantity", %{ingredient_id: 999_999, quantity: 1}) ==
               "no ingredient with id 999999"
    end
  end

  describe "add_ingredient" do
    test "stores the ingredient with the supermarket product behind it" do
      assert %{"name" => "Roomboter"} =
               call!("add_ingredient", %{name: "Roomboter", supermarket_product_id: 10_567_923})

      ingredient = Repo.get_by!(Ingredient, name: "Roomboter")

      assert ingredient.supermarket_product_id == 10_567_923
      assert ingredient.is_essential == false

      assert get_in(ingredient.supermarket_product_raw, ["productCard", "title"]) ==
               "Flower Farm Bakken zonder palm"
    end

    test "refuses a supermarket product that is already an ingredient" do
      call!("add_ingredient", %{name: "Roomboter", supermarket_product_id: 10_567_923})

      assert call_error("add_ingredient", %{name: "Boter", supermarket_product_id: 10_567_923}) =~
               "supermarket_product_id"
    end
  end

  describe "list_recipes" do
    test "lists every recipe with its ingredients" do
      insert!(:recipe, title: "Nasi", ingredients: [insert!(:ingredient, name: "Rijst")])
      insert!(:recipe, title: "Pizza")

      assert [
               %{"title" => "Nasi", "ingredients" => [%{"name" => "Rijst", "quantity" => 1}]},
               %{"title" => "Pizza", "ingredients" => []}
             ] = call!("list_recipes")
    end

    test "filters on the title, ignoring case" do
      insert!(:recipe, title: "Nasi")
      insert!(:recipe, title: "Pizza")

      assert [%{"title" => "Pizza"}] = call!("list_recipes", %{query: "IZZ"})
    end
  end

  describe "get_recipe" do
    test "returns one recipe" do
      recipe = insert!(:recipe, title: "Nasi", ingredients: [insert!(:ingredient, name: "Rijst")])

      assert %{"title" => "Nasi", "is_planned" => false, "ingredients" => [%{"name" => "Rijst"}]} =
               call!("get_recipe", %{recipe_id: recipe.id})
    end

    test "reports an unknown recipe" do
      assert call_error("get_recipe", %{recipe_id: 999_999}) == "no recipe with id 999999"
    end
  end

  describe "add_recipe" do
    test "stores an empty recipe" do
      assert %{"title" => "Nasi", "ingredients" => []} = call!("add_recipe", %{title: "Nasi"})

      assert Enum.map(Recipe.list_recipes(), & &1.title) == ["Nasi"]
    end

    test "reports a missing title" do
      assert call_error("add_recipe", %{}) =~ "title"
    end
  end

  describe "edit_recipe" do
    test "replaces the ingredient list wholesale" do
      rijst = insert!(:ingredient, name: "Rijst")
      kip = insert!(:ingredient, name: "Kip")
      recipe = insert!(:recipe, title: "Nasi", ingredients: [rijst])

      assert %{"title" => "Nasi goreng", "description" => "Lekker"} =
               call!("edit_recipe", %{
                 recipe_id: recipe.id,
                 title: "Nasi goreng",
                 description: "Lekker",
                 ingredients: [%{ingredient_id: kip.id, quantity: 2}]
               })

      refs = Repo.all(from(r in IngredientRef, where: r.recipe_id == ^recipe.id))

      assert Enum.map(refs, &{&1.ingredient_id, &1.quantity}) == [{kip.id, 2}]
      assert Repo.get!(Picape.Recipe.Recipe, recipe.id).title == "Nasi goreng"
    end
  end

  describe "plan_recipe and unplan_recipe" do
    test "plans a recipe onto the current order" do
      ingredient = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)
      recipe = insert!(:recipe, title: "Nasi", ingredients: [ingredient])

      assert %{"is_planned" => true} = call!("plan_recipe", %{recipe_id: recipe.id})
      assert Order.planned_recipes("1") == {:ok, [recipe.id]}

      assert {:ok, cart} = Order.cart("1")
      assert Map.keys(cart) == [ingredient.supermarket_product_id]
    end

    test "unplans it again" do
      ingredient = insert!(:ingredient, name: "Rijst", supermarket_product_id: 10_583_837)
      recipe = insert!(:recipe, title: "Nasi", ingredients: [ingredient])

      call!("plan_recipe", %{recipe_id: recipe.id})
      call!("unplan_recipe", %{recipe_id: recipe.id})

      assert Order.planned_recipes("1") == {:ok, []}
    end

    test "reports an unknown recipe" do
      assert call_error("plan_recipe", %{recipe_id: 999_999}) == "no recipe with id 999999"
    end
  end

  defp request(method, params \\ %{}) do
    %{jsonrpc: "2.0", id: 1, method: method, params: params}
    |> Jason.encode!()
    |> post_mcp()
    |> json_response(200)
  end

  defp post_mcp(conn \\ build_conn(), body) do
    conn
    |> put_req_header("content-type", "application/json")
    |> post("/mcp", body)
  end

  defp call!(name, arguments \\ %{}) do
    result = request("tools/call", %{name: name, arguments: arguments})["result"]

    refute result["isError"]
    content(result)
  end

  defp call_error(name, arguments) do
    result = request("tools/call", %{name: name, arguments: arguments})["result"]

    assert result["isError"]
    content(result)["error"]
  end

  defp content(result) do
    result["content"] |> hd() |> Map.fetch!("text") |> Jason.decode!()
  end
end
