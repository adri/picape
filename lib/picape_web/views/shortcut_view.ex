defmodule PicapeWeb.ShortcutView do
  use PicapeWeb, :view

  def render("add_ingredient.json", %{ingredient: ingredient}) do
    %{
      type: "single",
      success: "true",
      id: ingredient.id,
      name: ingredient.name,
      image_url: ingredient[:image_url],
      unit_quantity: ingredient[:unit_quantity]
    }
  end

  def render("choose_ingredient.json", %{ingredients: ingredients}) do
    %{
      type: "choice",
      success: "true",
      ingredients: Enum.map(ingredients, fn ingredient ->
        {ingredient.name,
          %{
           id: ingredient.id,
           name: ingredient.name,
           image_url: ingredient[:image_url],
           unit_quantity: ingredient[:unit_quantity]
          }
        }
      end) |> Enum.into(%{}),
    }
  end
end
