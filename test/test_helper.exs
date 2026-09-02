{:ok, _} = Picape.SupermarketFake.start(4021)
ExUnit.start(exclude: [:skip])

Ecto.Adapters.SQL.Sandbox.mode(Picape.Repo, :manual)
