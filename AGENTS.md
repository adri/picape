# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use Mix directly in the repo root. The `bin/` scripts wrap multi-process work.

Checks (run these before you report a change as done):
- `mix check` — backend gate, runs in the test env: `format --check-formatted`, `credo --strict`, `bin/compile-check` (fails on any compile warning except the Absinthe 1.5 deprecation notices), `mix test`, `mix sobelow`. Needs Postgres: `docker compose up -d postgres`.
- `cd frontend && npm run check` — ESLint (`universe/native`), Prettier check, Jest. `npm run format` fixes formatting. Use npm, not yarn: `package-lock.json` is the lockfile the Dockerfile and CI use.
- `bin/e2e` — Playwright screen tests in WebKit with the iPhone 14 profile against the fake stack. Compares against `e2e/tests/__screenshots__/*.png`. `bin/e2e --update` accepts the current screenshots as the new baseline; look at the diff in `tmp/e2e/` before you do. Refuses to run while Phoenix on :4010 is in live mode.
- `bin/ci` — what GitHub Actions runs: `mix check` plus the frontend check.

Local stack (ports: Phoenix 4010, Expo web 19006, supermarket fake 4020, Postgres 5433):
- `bin/phx` — Phoenix against your dev database and the live supermarket API. Needs a valid row in `supermarket_login` and `config/dev.secret.exs`.
- `bin/phx --fake` — resets the seeded `picape_e2e` database and points Phoenix at the supermarket fake. Deterministic, safe, never touches the real cart. This is what `bin/e2e` uses.
- `bin/supermarket-fake` — the supermarket stand-in on :4020. Serves `test/fixtures/supermarket` and keeps a basket in memory that follows `UpdateMyListBasket` mutations. `POST /__reset` restores the fixture basket.
- `cd frontend && npm run web` — Expo web dev server on :19006. Expo needs about a minute to start; keep it running between runs.
- `.claude/launch.json` has `backend`, `backend-fake`, `supermarket-fake` and `frontend` entries for the built-in browser preview.

Supermarket (the code and docs say "supermarket", never the chain's name):
- `bin/supermarket-snapshot` — records trimmed live responses into `test/fixtures/supermarket` and doubles as a smoke test of the supermarket connection. Needs a valid login. If it fails with a 401 on `/mobile-auth/v1/auth/token/refresh`, the refresh token in `supermarket_login` is dead and you need a new one from the supermarket's iOS app (see below).
- `SUPERMARKET_BASE_URL=http://localhost:4020 mix phx.server` — point any dev process at the fake; `bin/phx --fake` sets this for you.
- `SUPERMARKET_PROXY=1 bin/phx` — sends all supermarket traffic through Proxyman on :9090 with the Proxyman CA trusted, so you can compare Picape's requests with the app's. Both dev-only overrides live in [config/runtime.exs](config/runtime.exs).

Recording the supermarket's iOS app with Proxyman (the app is App Store only, so use a real iPhone on the same Wi-Fi as the Mac):
1. Open Proxyman on the Mac. `Tools → Proxy Settings` shows the port (9090) and the Mac's IP.
2. On the iPhone: `Settings → Wi-Fi → (i) → Configure Proxy → Manual`, server = the Mac's IP, port 9090.
3. On the iPhone, open `http://proxy.man/ssl` in Safari, install the downloaded profile (`Settings → Profile Downloaded → Install`), then enable it under `Settings → General → About → Certificate Trust Settings`.
4. In Proxyman: `Tools → SSL Proxying List`, add the API host (the `base_url` host in `config/dev.secret.exs`) with port 443.
5. `proxyman-cli clear-session`, then use the app: log in, open the basket, add and remove a product.
6. Export: `/Applications/Proxyman.app/Contents/MacOS/proxyman-cli export-log -m domains --domains <api host> -o tmp/app.har -f har`, then `sleep 3` because the CLI returns before the file is written. Read the HAR with `jq` or the `proxyman-mobile-audit` skill's analyzer.
7. The request to `/mobile-auth/v1/auth/token/refresh` carries the current `refreshToken`; the response returns a new one. Store that value in `supermarket_login.refresh_token` and clear the proxy setting on the phone afterwards.

Other:
- `mix ecto.reset` — drop, create, migrate and seed. `PICAPE_DB=picape_e2e` targets the e2e database.
- `mix test path/to/file.exs:LINE` — single test. Tests start the supermarket fake on :4021 in `test/test_helper.exs`.
- `mix graphql.schema` — regenerate the Absinthe JSON schema (alias for `absinthe.schema.json`).
- `bin/setup` — first-time bootstrap.

Credentials live in `config/dev.secret.exs` (gitignored) and `config/runtime.exs` via env vars (`NEW_RELIC_LICENSE_KEY`, `SENTRY_DSN`, supermarket auth). Don't commit those.

## Deploy

GitHub Actions deploys. [ci.yml](.github/workflows/ci.yml) runs the backend and frontend checks on every push and pull request. [deploy.yml](.github/workflows/deploy.yml) runs `flyctl deploy --remote-only` after CI succeeds on `master`. It needs the `FLY_API_TOKEN` repository variable in the GitHub repo settings. `fly deploy` from your machine still works but skips the checks.

## Architecture

Phoenix 1.6 app split the conventional way:

- `lib/picape/` — domain contexts (no web concerns)
- `lib/picape_web/` — Phoenix endpoint, router, controllers, and the Absinthe GraphQL layer
- `frontend/` — Expo/React Native client (current)
- `assets/` — legacy Next.js bundle, still wired up as a dev watcher
- `e2e/` — Playwright screen tests, own `package.json` so it survives Expo upgrades

### Domain contexts (`lib/picape/`)

Each top-level `.ex` file is a context module; the sibling directory holds its Ecto schemas and helpers.

- **Recipe** (`recipe.ex`, `recipe/`) — recipes with `IngredientRef` join rows that carry quantity-per-recipe. `item_quantities/1` aggregates ingredient needs across multiple planned recipes, excluding those flagged `is_essential`.
- **Order** (`order.ex`, `order/`) — the core of the app. Takes a set of `PlannedRecipe`s plus `ManualIngredient` overrides, computes the merged ingredient list, diffs it against the current supermarket cart (`Order.Sync.changes/3` produces an `add/remove` struct), and pushes the diff via `Supermarket.apply_changes/2`. Two "lens" modules convert between representations: `LineFromSupermarket` (live cart → order lines) and `LineFromDb` (historical orders → lines).
- **Supermarket** (`supermarket.ex`, `supermarket/`) — HTTPoison-based client for the supermarket's `mobile-services` / `mobile-auth` APIs. Auth is a refresh-token flow handled by `Supermarket.KeepLogin`; responses are cached in a `ConCache` named `:supermarket`. `CartItems.apply_changes/2` translates internal change structs into the JSON shape the supermarket's cart endpoint expects, and `apply_changes/2` retries up to 3x on 400s and re-applies on 409 conflicts.
- **Ingredients** (`ingredients.ex`) — ingredient CRUD plus `match_supermarket_products/0` which runs nightly to reconcile ingredients with their supermarket product IDs.
- **Shopping** (`shopping.ex`, `shopping/bought_ingredient.ex`) — tracks which ingredients have been marked bought during an active shopping session.
- **Seasonal** (`seasonal.ex`, `seasonal/`) — scrapes `groentefruit.milieucentraal.nl` once and keeps the parsed data in an `Agent` + `ConCache` for lookups.
- **Scheduler** (`scheduler.ex`) — Quantum jobs defined in [config/config.exs](config/config.exs): daily cart/order sync, hourly supermarket access-token refresh, daily ingredient/product matching.

Supervision tree lives in [lib/picape/application.ex](lib/picape/application.ex): `Phoenix.PubSub` → `Repo` → `Endpoint` → `Absinthe.Subscription` → `Scheduler` → `ConCache(:supermarket)`.

### GraphQL layer (`lib/picape_web/graphql/`)

- [schema.ex](lib/picape_web/graphql/schema.ex) is the single Absinthe schema. Uses `Absinthe.Relay` (`:modern`) — all IDs are Relay global IDs decoded by the `ParseIDs` middleware using the `@node_id_rules` map at the top of the file. **If you add a field whose argument takes a typed ID, add it to `@node_id_rules` or the middleware won't decode it.**
- Resolvers split by context in `resolver/{order,recipe,shopping,supermarket}.ex`.
- Mutations are wrapped in `handle_errors/1`, which converts `Ecto.Changeset` errors into Absinthe-compatible `{:error, [...]}` tuples.
- Subscriptions (`order_changed`, `recipe_planned`, `recipe_unplanned`) are triggered off mutations and broadcast on topic `"*"`. They rely on `Absinthe.Subscription` being in the supervision tree.
- The REST-ish `/shortcut/*` endpoints in [router.ex](lib/picape_web/router.ex) exist for Apple Shortcuts integration and bypass GraphQL entirely.

### Frontend

`frontend/` is the active client (Expo SDK 47, React Navigation 5, Apollo Client 3, Absinthe socket link for subscriptions). It is deployed as a PWA and opened on an iPhone, so follow iOS design language. `assets/` is legacy Next.js and only runs because the dev watcher in [config/dev.exs](config/dev.exs) still spawns it.

### Test data

- `priv/repo/seeds.exs` is the e2e dataset. `bin/phx --fake` loads it into `picape_e2e`, and the Playwright screenshots depend on it. The plan screen groups recipes by ingredient names such as `rijst`, `pasta` and `wrap`, so keep those names Dutch.
- `test/fixtures/supermarket/*.json` are synthetic supermarket responses in the shape the code reads. `basket.json` product ids match the seeded essentials so the shop tab shows named ingredients.

## Conventions worth knowing

- `test/support` is compiled in every env except prod (see `elixirc_paths/1` in [mix.exs](mix.exs)). Seeds use `Picape.Factory` from there, and `bin/supermarket-fake` and `bin/supermarket-snapshot` use `Picape.SupermarketFake` and `Picape.SupermarketSnapshot`. Shared test helpers go there.
- `lib/picape/supermarket.ex` has `IO.inspect` calls in `process_request_url/1` and `process_response_status_code/1` that log every outbound HTTP call. They're intentional debug hooks — don't "clean them up" without asking. `.credo.exs` excludes that file from the `IoInspect` check for this reason.
- `lib/picape/supermarket_old.ex` and `supermarket/search_result_old.ex` are kept around for reference from the pre-v4 supermarket API. Don't extend them; add to the current versions. Credo skips them.
- The supermarket client expects `X-Correlation-Id` headers and a Bearer token managed by `KeepLogin`. If you add a new endpoint, route it through `get!/put!/post!` on the `Picape.Supermarket` module so it inherits the auth + encoding pipeline, and add a matching route to `Picape.SupermarketFake`.
- `bin/compile-check` whitelists the four `map.field notation` warnings Absinthe 1.5 emits on Elixir 1.18. Switch `mix check` back to `compile --warnings-as-errors` once Absinthe is upgraded.
- ESLint runs `react-hooks/rules-of-hooks` as a warning because seven screens call hooks after an early return. Fix those before you turn it back into an error.
- If a build fails with `module Sentry.Plug is not loaded`, the `_build/<env>` cache compiled Sentry before Plug. Delete that `_build/<env>` directory and compile again.
