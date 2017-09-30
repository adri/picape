defmodule Picape.AbsintheCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      use ExUnit.Case
      use Picape.DataCase, async: true
      import Picape.AbsintheCase
    end
  end

  def run(document, options \\ [], schema \\ PicapeWeb.Graphql.Schema) do
    Absinthe.run(document, schema, options)
  end
end
