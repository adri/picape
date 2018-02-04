defmodule PicapeWeb.PageView do
  use PicapeWeb, :view

  def render("index.json", %{recipes: recipes, essentials: essentials}) do
    %{
      recipes: Enum.map(recipes, &recipe_json/1),
      essentials: Enum.map(essentials, &ingredient_json/1)
    }
  end

  def recipe_json(recipe) do
    %{
      title: recipe.title,
      ingredients:
        Enum.map(recipe.ingredients, fn ingredient ->
          %{
            quantity: ingredient.quantity,
            ingredient: ingredient_json(ingredient.ingredient)
          }
        end)
    }
  end

  def ingredient_json(ingredient) do
    %{
      name: ingredient.name,
      image_url: ingredient[:image_url],
      unit_quantity: ingredient[:unit_quantity]
    }
  end
end
