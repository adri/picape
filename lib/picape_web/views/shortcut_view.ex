defmodule PicapeWeb.ShortcutView do
  use PicapeWeb, :view

  def render("add_ingredient.json", %{ingredient: ingredient}) do
    %{
      success: "true",
      id: ingredient.id,
      name: ingredient.name,
      image_url: ingredient[:image_url],
      unit_quantity: ingredient[:unit_quantity]
    }
  end
end
