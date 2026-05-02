# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use Mix directly in the repo root — the `bin/` wrappers are thin and mostly exist for first-time setup / CI.

- `bin/setup` — one-time bootstrap: `mix deps.get`, `yarn install` in `assets/`, `mix ecto.setup`, then `bin/ci`.
- `bin/ci` — what CI runs: compile with `--warnings-as-errors`, `mix coveralls.json`, and `mix sobelow --exit Low --with-code --ignore Config.HTTPS`.
- `mix phx.server` — start the backend on http://localhost:4000 (GraphQL at `/graphql`, GraphiQL at `/graphiql`). The dev endpoint also spawns a Next.js dev watcher for the legacy `assets/` bundle on port 4001 (see [config/dev.exs](config/dev.exs)).
- `mix ecto.reset` — drop + recreate + migrate + seed.
- `mix test` — runs the `test` alias, which does `ecto.create --quiet`, `ecto.migrate`, then `test`. Run a single test with `mix test path/to/file.exs:LINE`.
- `mix graphql.schema` — regenerate the Absinthe JSON schema (alias for `absinthe.schema.json`).

Frontend (Expo / React Native, lives in `frontend/`):
- `cd frontend && yarn start` / `yarn web` / `yarn ios` / `yarn android`
- `cd frontend && yarn test` — Jest via `jest-expo`

Secrets live in `config/dev.secret.exs` (gitignored) and `config/runtime.exs` via env vars (`NEW_RELIC_LICENSE_KEY`, `SENTRY_DSN`, supermarket auth). Don't commit those.

## Architecture

Phoenix 1.6 app split the conventional way:

- `lib/picape/` — domain contexts (no web concerns)
- `lib/picape_web/` — Phoenix endpoint, router, controllers, and the Absinthe GraphQL layer
- `frontend/` — Expo/React Native client (current)
- `assets/` — legacy Next.js bundle, still wired up as a dev watcher

### Domain contexts (`lib/picape/`)

Each top-level `.ex` file is a context module; the sibling directory holds its Ecto schemas and helpers.

- **Recipe** (`recipe.ex`, `recipe/`) — recipes with `IngredientRef` join rows that carry quantity-per-recipe. `item_quantities/1` aggregates ingredient needs across multiple planned recipes, excluding those flagged `is_essential`.
- **Order** (`order.ex`, `order/`) — the core of the app. Takes a set of `PlannedRecipe`s plus `ManualIngredient` overrides, computes the merged ingredient list, diffs it against the current supermarket cart (`Order.Sync.changes/3` produces an `add/remove` struct), and pushes the diff via `Supermarket.apply_changes/2`. Two "lens" modules convert between representations: `LineFromSupermarket` (live cart → order lines) and `LineFromDb` (historical orders → lines).
- **Supermarket** (`supermarket.ex`, `supermarket/`) — HTTPoison-based client for Albert Heijn's `mobile-services` / `mobile-auth` APIs. Auth is a refresh-token flow handled by `Supermarket.KeepLogin`; responses are cached in a `ConCache` named `:supermarket`. `CartItems.apply_changes/2` translates internal change structs into the JSON shape AH's cart endpoint expects, and `apply_changes/2` retries up to 3x on 400s and re-applies on 409 conflicts.
- **Ingredients** (`ingredients.ex`) — ingredient CRUD plus `match_supermarket_products/0` which runs nightly to reconcile ingredients with their supermarket product IDs.
- **Shopping** (`shopping.ex`, `shopping/bought_ingredient.ex`) — tracks which ingredients have been marked bought during an active shopping session.
- **Seasonal** (`seasonal.ex`, `seasonal/`) — scrapes `groentefruit.milieucentraal.nl` once and keeps the parsed data in an `Agent` + `ConCache` for lookups.
- **Scheduler** (`scheduler.ex`) — Quantum jobs defined in [config/config.exs](config/config.exs): daily cart/order sync, hourly AH access-token refresh, daily ingredient/product matching.

Supervision tree lives in [lib/picape/application.ex](lib/picape/application.ex): `Phoenix.PubSub` → `Repo` → `Endpoint` → `Absinthe.Subscription` → `Scheduler` → `ConCache(:supermarket)`.

### GraphQL layer (`lib/picape_web/graphql/`)

- [schema.ex](lib/picape_web/graphql/schema.ex) is the single Absinthe schema. Uses `Absinthe.Relay` (`:modern`) — all IDs are Relay global IDs decoded by the `ParseIDs` middleware using the `@node_id_rules` map at the top of the file. **If you add a field whose argument takes a typed ID, add it to `@node_id_rules` or the middleware won't decode it.**
- Resolvers split by context in `resolver/{order,recipe,shopping,supermarket}.ex`.
- Mutations are wrapped in `handle_errors/1`, which converts `Ecto.Changeset` errors into Absinthe-compatible `{:error, [...]}` tuples.
- Subscriptions (`order_changed`, `recipe_planned`, `recipe_unplanned`) are triggered off mutations and broadcast on topic `"*"`. They rely on `Absinthe.Subscription` being in the supervision tree.
- The REST-ish `/shortcut/*` endpoints in [router.ex](lib/picape_web/router.ex) exist for Apple Shortcuts integration and bypass GraphQL entirely.

### Frontend

`frontend/` is the active client (Expo SDK 47, React Navigation 5, Apollo Client 3, Absinthe socket link for subscriptions). `assets/` is legacy Next.js and only runs because the dev watcher in [config/dev.exs](config/dev.exs) still spawns it.

## Conventions worth knowing

- `Mix.env() == :test` compiles `test/support` into the app (see `elixirc_paths/1` in [mix.exs](mix.exs)). Shared test helpers go there.
- `lib/picape/supermarket.ex` has `IO.inspect` calls in `process_request_url/1` and `process_response_status_code/1` that log every outbound HTTP call. They're intentional debug hooks — don't "clean them up" without asking.
- `lib/picape/supermarket_old.ex` and `supermarket/search_result_old.ex` are kept around for reference from the pre-v4 AH API. Don't extend them; add to the current versions.
- The AH client expects `X-Correlation-Id` headers and a Bearer token managed by `KeepLogin`. If you add a new endpoint, route it through `get!/put!/post!` on the `Picape.Supermarket` module so it inherits the auth + encoding pipeline.
