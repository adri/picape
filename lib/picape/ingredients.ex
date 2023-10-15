defmodule Picape.Ingredients do
  import Ecto.Query

  alias Picape.Repo
  alias Picape.Supermarket
  alias Picape.Recipe.{Ingredient, IngredientTag}

  @doc """
  Returns a list of ingredients.

  ## Examples

      iex> list()
      [%Ingredient{}, ...]
  """
  def list(args) do
    args
    |> list_query
    |> Repo.all()
  end

  def list_query(args) do
    args
    |> Enum.reduce(Ingredient, fn
      {:filter, filter}, query ->
        query |> filter_with(filter)

      {:order, order}, query ->
        query |> order_by_field(order)

      _, query ->
        query
    end)
  end

  defp filter_with(query, filter) do
    Enum.reduce(filter, query, fn
      {:name, name}, query ->
        from(q in query, where: ilike(q.name, ^"%#{name}%"))

      {:essential, essential}, query ->
        from(q in query, where: q.is_essential == ^essential)

      {:excluded, ids}, query ->
        from(q in query, where: q.id not in ^ids)

      {:tag_ids, []}, query ->
        query

      {:tag_ids, tag_ids}, query ->
        from(
          q in query,
          join: t in assoc(q, :tags),
          where: t.id in ^tag_ids
        )
    end)
  end

  defp order_by_field(query, order) do
    Enum.reduce(order, query, fn %{field: :name, direction: direction}, query ->
      from(q in query, order_by: {^direction, :name})
    end)
  end

  def list_tags() do
    query =
      from(
        t in IngredientTag,
        left_join: ingredient in assoc(t, :ingredients),
        group_by: [t.id, t.name],
        select: %{id: t.id, name: t.name, count: count(ingredient.id)}
      )

    {:ok, Repo.all(query)}
  end

  def ingredients_by_ids(ids) do
    result =
      from(i in Ingredient, where: i.id in ^ids)
      |> Repo.all()
      |> Repo.preload(:tags)
      |> Map.new(fn ingredient -> {ingredient.id, ingredient} end)

    {:ok, result}
  end

  def count_all() do
    {:ok, Repo.aggregate(Ingredient, :count, :id)}
  end

  def add_ingredient(params) do
    %Ingredient{}
    |> Ingredient.add_changeset(
      Map.put(
        params,
        :supermarket_product_raw,
        Supermarket.products_by_id(params[:supermarket_product_id])
      )
    )
    |> Repo.insert()
  end

  def by_supermarket_id(supermarket_id) do
    Repo.one(from(i in Ingredient, where: i.supermarket_product_id == ^supermarket_id))
  end

  def edit_ingredient(params) do
    tags = Repo.all(from(t in IngredientTag, where: t.id in ^params[:tag_ids]))

    Repo.get(Ingredient, params[:ingredient_id])
    |> Repo.preload(:tags)
    |> Ingredient.edit_changeset(
      Map.put(
        params,
        :supermarket_product_raw,
        Supermarket.products_by_id(params[:supermarket_product_id])
      )
    )
    |> Ecto.Changeset.put_assoc(:tags, tags)
    |> Repo.update()
  end

  def delete_ingredient(params) do
    Repo.get(Ingredient, params[:ingredient_id])
    |> Repo.delete()
  end

  def match_supermarket_products() do
    Ingredient
    |> Repo.all()
    |> Enum.map(fn ingredient ->
      Supermarket.invalidate_product(ingredient.supermarket_product_id)

      ingredient
      |> Ingredient.raw_changeset(%{
        supermarket_product_raw: Supermarket.products_by_id(ingredient.supermarket_product_id)
      })
    end)
    |> Enum.map(&Repo.update!/1)
  end
end
