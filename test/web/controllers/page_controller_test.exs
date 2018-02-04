defmodule PicapeWeb.PageControllerTest do
  use PicapeWeb.ConnCase

  test "POST /graphql", %{conn: conn} do
    conn = post(conn, "/graphql")
    assert response(conn, 400) =~ "No query document supplied"
  end
end
