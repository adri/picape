defmodule Picape.Graphql.SchemaSdlTest do
  use ExUnit.Case, async: true

  @sdl_path Path.expand("../../priv/graphql/schema.graphql", __DIR__)

  test "priv/graphql/schema.graphql matches the schema" do
    if File.read!(@sdl_path) != Absinthe.Schema.to_sdl(PicapeWeb.Graphql.Schema) do
      flunk("priv/graphql/schema.graphql is stale. Run mix graphql.schema and commit the result.")
    end
  end
end
