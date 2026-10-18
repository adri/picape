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
    with {:ok, params} <- fetch_product_raw(params, params[:supermarket_product_id]) do
      %Ingredient{}
      |> Ingredient.add_changeset(params)
      |> Repo.insert()
    end
  end

  @doc "The ingredients behind a set of supermarket product ids, keyed by that id."
  def by_supermarket_product_ids(supermarket_ids) do
    from(i in Ingredient, where: i.supermarket_product_id in ^supermarket_ids)
    |> Repo.all()
    |> Map.new(fn ingredient -> {ingredient.supermarket_product_id, ingredient} end)
  end

  @doc "The ingredients behind a set of Picnic product ids, keyed by that id. Non-string ids are dropped: checklist rows key items by ingredient id."
  def by_picnic_product_ids(picnic_ids) do
    result =
      from(i in Ingredient, where: i.picnic_product_id in ^Enum.filter(picnic_ids, &is_binary/1))
      |> Repo.all()
      |> Map.new(fn ingredient -> {ingredient.picnic_product_id, ingredient} end)

    {:ok, result}
  end

  def by_supermarket_id(supermarket_id) do
    Repo.one(from(i in Ingredient, where: i.supermarket_product_id == ^supermarket_id))
  end

  @doc """
  Updates an ingredient with the fields `params` carries. A field that is absent
  keeps its current value, so a caller that only wants to move the ingredient to
  another supermarket product needs to send nothing else.
  """
  def edit_ingredient(params) do
    ingredient = Repo.get(Ingredient, params[:ingredient_id]) |> Repo.preload(:tags)

    with {:ok, params} <- put_product_raw(params, ingredient) do
      ingredient
      |> Ingredient.edit_changeset(params)
      |> put_tags(params)
      |> Repo.update()
    end
  end

  # A move to another product needs that product's card; an edit that keeps
  # the id keeps the card it already has, so it works while the supermarket
  # is down.
  defp put_product_raw(%{supermarket_product_id: product_id} = params, ingredient)
       when not is_nil(product_id) do
    if to_string(product_id) == to_string(ingredient.supermarket_product_id) do
      {:ok, params}
    else
      fetch_product_raw(params, product_id)
    end
  end

  defp put_product_raw(params, _ingredient), do: {:ok, params}

  defp fetch_product_raw(params, product_id) do
    {:ok, Map.put(params, :supermarket_product_raw, Supermarket.products_by_id(product_id))}
  rescue
    _ -> {:error, "the supermarket is unreachable"}
  end

  defp put_tags(changeset, %{tag_ids: tag_ids}) when is_list(tag_ids) do
    Ecto.Changeset.put_assoc(changeset, :tags, Repo.all(from(t in IngredientTag, where: t.id in ^tag_ids)))
  end

  defp put_tags(changeset, _params), do: changeset

  def delete_ingredient(params) do
    Repo.get(Ingredient, params[:ingredient_id])
    |> Repo.delete()
  end

  def match_supermarket_products() do
    Ingredient
    |> Repo.all()
    |> Enum.map(fn ingredient ->
      Supermarket.invalidate_product(ingredient.supermarket_product_id)

      try do
        ingredient
        |> Ingredient.raw_changeset(%{
          supermarket_product_raw: Supermarket.products_by_id(ingredient.supermarket_product_id)
        })
        |> Repo.update!()
      rescue
        _ -> nil
      end
    end)
  end
end
