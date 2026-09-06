defmodule Picape.Seasonal do
  @moduledoc """
  When the produce Picape knows is in season in the Netherlands, and which
  recipes suit a given month.

  The calendar below is hand written from public Dutch growing calendars. It is
  prescriptive: it says when produce grows here, not what the user tends to buy.
  The supermarket's own `provenanceStatement` cannot stand in for it, because it
  is a calendar of origin rather than season: it reports greenhouse strawberries
  as Dutch in all twelve months, and it carries nothing at all for pumpkin,
  stewing pears, leek, spinach and green beans.

  Produce that is Dutch every month of the year, such as potatoes, onions,
  carrots and mushrooms, is deliberately absent. Its season never changes, so it
  cannot inform what to cook this week, and counting it would only flatten the
  recipe ranking. Produce with no Dutch season at all, such as citrus, avocado
  and banana, is absent for the same reason. A name the calendar does not carry
  is unknown, never out of season.
  """

  alias Picape.{Ingredients, Recipe}

  # {produce, the months it is in season in the Netherlands, the other
  # ingredient names that mean the same produce}
  @calendar [
    {"aardbeien", [5, 6, 7, 8, 9], []},
    {"andijvie", [5, 6, 7, 8, 9, 10], []},
    {"appels", [1, 2, 3, 4, 9, 10, 11, 12], ["appel"]},
    {"asperges", [4, 5, 6], ["asperges groen", "asperges wit", "asperge"]},
    {"aubergine", [6, 7, 8, 9, 10], []},
    {"blauwe bessen", [7, 8, 9], ["blauwe bes"]},
    {"bleekselderij", [7, 8, 9, 10, 11], []},
    {"bloemkool", [5, 6, 7, 8, 9, 10, 11], []},
    {"boerenkool", [1, 2, 9, 10, 11, 12], []},
    {"bosui", [5, 6, 7, 8, 9, 10], ["bosuien"]},
    {"bramen", [7, 8, 9, 10], ["braam"]},
    {"broccoli", [6, 7, 8, 9, 10], []},
    {"courgette", [6, 7, 8, 9, 10], []},
    {"doperwten", [6, 7, 8], ["doperwt"]},
    {"frambozen", [6, 7, 8, 9, 10], ["framboos"]},
    {"kersen", [6, 7], []},
    {"knolselderij", [1, 2, 3, 9, 10, 11, 12], []},
    {"komkommer", [4, 5, 6, 7, 8, 9, 10], []},
    {"koolraap", [1, 2, 3, 10, 11, 12], []},
    {"paprika", [6, 7, 8, 9, 10], ["puntpaprika"]},
    {"pastinaak", [1, 2, 3, 10, 11, 12], []},
    {"peren", [1, 2, 3, 9, 10, 11, 12], ["peer"]},
    {"pompoen", [8, 9, 10, 11, 12], ["flespompoen"]},
    {"postelein", [4, 5, 6, 7, 8], []},
    {"prei", [1, 2, 3, 9, 10, 11, 12], []},
    {"pruimen", [8, 9], []},
    {"rabarber", [4, 5, 6], []},
    {"radijs", [4, 5, 6, 7, 8, 9], []},
    {"rode bessen", [7, 8], []},
    {"rodekool", [1, 2, 9, 10, 11, 12], ["rode kool"]},
    {"rucola", [5, 6, 7, 8, 9, 10, 11], []},
    {"sla", [5, 6, 7, 8, 9, 10], ["ijsbergsla", "romaine sla", "kropsla"]},
    {"snijbonen", [7, 8, 9], []},
    {"sperziebonen", [6, 7, 8, 9], []},
    {"spinazie", [4, 5, 6, 9, 10], []},
    {"spruitjes", [1, 2, 10, 11, 12], ["spruiten"]},
    {"stoofperen", [1, 2, 3, 9, 10, 11, 12], ["stoofpeer"]},
    {"tomaten", [6, 7, 8, 9, 10], ["tomaat", "cherrytomaat", "cherrytomaten"]},
    {"tuinbonen", [5, 6, 7], []},
    {"veldsla", [1, 2, 3, 10, 11, 12], []},
    {"venkel", [6, 7, 8, 9, 10], []},
    {"witlof", [1, 2, 3, 10, 11, 12], []},
    {"witte kool", [1, 2, 9, 10, 11, 12], ["wittekool"]}
  ]

  @by_name Map.new(
             for {produce, months, aliases} <- @calendar,
                 name <- [produce | aliases],
                 do: {name, {produce, months}}
           )

  @doc """
  The produce an ingredient name stands for, and the months it is in season.

  Returns nil when the calendar does not carry the name, which means unknown
  rather than out of season.
  """
  @spec produce_for(binary) :: {binary, [1..12]} | nil
  def produce_for(name), do: Map.get(@by_name, normalize(name))

  @doc """
  What to cook in `month`: the ingredients Picape knows that are in season, the
  ones that are not, and every recipe that uses produce the calendar carries,
  ranked by how much of it is in season.
  """
  @spec overview(1..12) :: map
  def overview(month) do
    {in_season, out_of_season} =
      []
      |> Ingredients.list()
      |> Enum.filter(&produce_for(&1.name))
      |> Enum.split_with(&in_season?(&1.name, month))

    %{
      month: month,
      in_season: Enum.sort(Enum.map(in_season, &produce_line/1)),
      out_of_season: Enum.sort(Enum.map(out_of_season, &produce_line/1)),
      recipes: ranked_recipes(month)
    }
  end

  defp in_season?(name, month) do
    {_produce, months} = produce_for(name)
    month in months
  end

  defp produce_line(ingredient) do
    {produce, _months} = produce_for(ingredient.name)
    if produce == normalize(ingredient.name), do: ingredient.name, else: "#{ingredient.name} (#{produce})"
  end

  defp ranked_recipes(month) do
    recipes = Recipe.list_recipes()
    {:ok, refs} = Recipe.ingredients_by_recipe_ids(Enum.map(recipes, & &1.id))

    recipes
    |> Enum.map(&score_recipe(&1, refs[&1.id] || [], month))
    |> Enum.reject(&(&1.in_season == [] and &1.out_of_season == []))
    |> Enum.sort_by(&{-&1.score, -length(&1.in_season), &1.title})
  end

  defp score_recipe(recipe, refs, month) do
    {in_season, out_of_season} =
      refs
      |> Enum.map(& &1.ingredient.name)
      |> Enum.filter(&produce_for/1)
      |> Enum.split_with(&in_season?(&1, month))

    %{
      recipe_id: recipe.id,
      title: recipe.title,
      score: length(in_season) - length(out_of_season),
      in_season: Enum.sort(in_season),
      out_of_season: Enum.sort(out_of_season)
    }
  end

  defp normalize(name) do
    name
    |> String.downcase()
    |> String.trim()
    |> String.replace(~r/\s+/, " ")
  end
end
