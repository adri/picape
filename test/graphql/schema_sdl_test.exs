defmodule Picape.Graphql.SchemaSdlTest do
  use ExUnit.Case, async: true

  @sdl_path Path.expand("../../priv/graphql/schema.graphql", __DIR__)

  test "priv/graphql/schema.graphql matches the schema (run mix graphql.schema to update)" do
    assert File.read!(@sdl_path) == Absinthe.Schema.to_sdl(PicapeWeb.Graphql.Schema)
  end
end
