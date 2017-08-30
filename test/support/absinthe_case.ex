defmodule Picape.AbsintheCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      use ExUnit.Case
      ExUnit.Case.register_attribute __ENV__, :query
      ExUnit.Case.register_attribute __ENV__, :variables

      use Picape.DataCase, async: true
      import Picape.AbsintheCase
    end
  end

  setup %{registered: reg} = ctx do
    ctx = if reg[:query], do: Map.put(ctx, :query, reg[:query]), else: ctx
    ctx = if reg[:variables], do: Map.put(ctx, :variables, reg[:variables]), else: ctx
    {:ok, ctx}
  end

  def run(document, options \\ [], schema \\ PicapeWeb.Graphql.Schema) do
    Absinthe.run(document, schema, options)
  end
end
