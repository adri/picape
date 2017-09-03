defmodule Picape.Graphql.QueryEssentialTest do
  use Picape.AbsintheCase

  test "returns a list of essentials" do
    insert! :essential, name: "Flour"
    insert! :essential, name: "Milk"

    actual = run("{
       essentials {
        name
      }
    }")

    assert actual === {:ok, %{data: %{
      "essentials" => [
        %{ "name" => "Flour" },
        %{ "name" => "Milk" },
      ]
    }}}
  end

  test "does not return ingredients" do
    insert! :essential, name: "Flour"
    insert! :ingredient, name: "Mince"

    actual = run("{
       essentials {
        name
      }
    }")

    assert actual === {:ok, %{data: %{
       "essentials" => [
         %{ "name" => "Flour" },
       ]
     }}}
  end
end
