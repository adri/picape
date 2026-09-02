# AGENTS.md

Guidance for coding agents working in this repository. Everything project specific that an agent must remember lives here, not in agent memory.

## Commands

Use Mix directly in the repo root. The `bin/` scripts wrap multi-process work. Tool versions are pinned in `.tool-versions` (Erlang, Elixir, Node 20.8.0) and read by asdf and CI; the Dockerfile hardcodes the same versions in its `ARG` lines, keep them in sync. A Homebrew `node` or `elixir` earlier in `PATH` wins over the asdf shim; check `node --version` prints 20.8.0 and `elixir --version` prints 1.20.4 before you trust a result. The `bin/` scripts source [bin/_toolchain](bin/_toolchain), which puts the asdf shims first for you, so prefer them over a bare `mix` when your own `PATH` is wrong. `bin/deploy`, `bin/setup` and `bin/update` do not source it yet.

Checks (run all three before you report a change as done):
- `mix check` — backend gate, runs in the test env: `format --check-formatted`, `credo --strict`, `compile --force --warnings-as-errors`, `mix test --warnings-as-errors`, `mix sobelow`. Needs Postgres: `docker compose up -d postgres`.
- `cd frontend && npm run check` — ESLint (`universe/native`), Prettier check, `npm run graphql:check` (validates every `gql` document against `priv/graphql/schema.graphql`), Jest. `npm run format` fixes formatting. Use npm, not yarn: `package-lock.json` is the lockfile the Dockerfile and CI use. Never run `npm ci --dry-run`; with npm 8 it deletes `node_modules` without reinstalling.
- `bin/e2e` — Playwright screen tests in WebKit with the iPhone 14 profile against the fake stack. Compares against `e2e/tests/__screenshots__/*.png`. `bin/e2e --update` accepts the current screenshots as the new baseline; look at the diff in `tmp/e2e/` before you do. Refuses to run while Phoenix on :4010 is in live mode. Baselines are macOS WebKit renders and only compare on a Mac; `E2E_SKIP_SCREENSHOTS=1` (what CI sets) keeps the functional checks and saves screenshots to `tmp/e2e/` instead of comparing. CI also sets `E2E_BROWSER=chromium` because installing WebKit's system libraries on the runner hangs; locally the suite runs in WebKit.
- `bin/ci` — what GitHub Actions runs locally: `mix check` plus the frontend check.

Local stack (ports: Phoenix 4010, Expo web 19006, supermarket fake 4020, Postgres 5433):
- `bin/phx` — Phoenix against your dev database and the live supermarket API. Needs a valid row in `supermarket_login` and `config/dev.secret.exs`.
- `bin/phx --fake` — resets the seeded `picape_e2e` database and points Phoenix at the supermarket fake. Deterministic, safe, never touches the real cart. This is what `bin/e2e` uses. Logs at `info` level unless `PICAPE_LOG_LEVEL` says otherwise. With `--db NAME` (or `PICAPE_DB` set), for example `bin/phx --fake --db picape_prod`, it keeps that database as it is and skips the reset; the `backend-prod` launch entry does this for the built-in browser. Fake mode also sets `SUPERMARKET_REFRESH=0`, so a copied production login is never refreshed against the fake.
- `bin/db-restore <dump> [db]` — restores a Postgres custom-format dump (a `pg_dump -Fc` of production) into a local database, default `picape_prod`. Use it for production-like data in the app: real recipe counts, long titles, tags. The dump includes `supermarket_login`; its tokens are a month old and dead, and refreshing them anywhere is pointless. Never run live mode on a copy whose token production still uses, see `SUPERMARKET_REFRESH` below.
- `bin/supermarket-fake` — the supermarket stand-in on :4020. Serves `test/fixtures/supermarket` and keeps a basket in memory that follows `UpdateMyListBasket` mutations. `POST /__reset` restores the fixture basket. Phoenix caches the cart for five hours, so after a reset also `POST http://localhost:4010/dev/invalidate-cart` (a dev-only route in the router); the e2e `beforeEach` does both.
- `cd frontend && npm run web` — Expo web dev server on :19006. Expo needs about a minute to start; keep it running between runs. Restart it after any change to `frontend/node_modules`.
- `.claude/launch.json` (local, gitignored by the user's global ignore) has `backend`, `backend-fake`, `supermarket-fake` and `frontend` entries for the built-in browser preview.

Inspecting the stack:
- `bin/status` — which ports are up, the Phoenix mode, and the size and age of each log in `tmp/`.
- `bin/web-probe [url]` — loads the page in WebKit on the iPhone profile and prints page errors, console errors and failed requests, and writes `tmp/probe.png`. Use it before reading any log when the app looks blank or broken.
- `PICAPE_LOG_LEVEL=debug bin/phx --fake` — turn Phoenix debug logging back on. e2e runs write Phoenix to `tmp/phx-e2e.log` and Expo to `tmp/expo-e2e.log`; Playwright stores a screenshot and trace of each failed test under `tmp/e2e/`.
- The intentional `IO.inspect` hooks in `Picape.Supermarket` print every outbound supermarket URL and status code, prefixed `133:` and `129:`.

Supermarket (the code and docs say "supermarket", never the chain's name):
- `bin/supermarket-snapshot` — records trimmed live responses into `test/fixtures/supermarket` and doubles as a smoke test of the supermarket connection. Needs a valid login. If it fails with a 401 on `/mobile-auth/v1/auth/token/refresh`, the refresh token in `supermarket_login` is dead and you need a new one from the supermarket's iOS app.
- `SUPERMARKET_BASE_URL=http://localhost:4020 mix phx.server` — point any dev process at the fake; `bin/phx --fake` sets this for you.
- `SUPERMARKET_PROXY=1 bin/phx` — sends all supermarket traffic through Proxyman on :9090 with the Proxyman CA trusted.
- `SUPERMARKET_REFRESH=0 bin/phx` — hands out the stored access token but never refreshes it. Refresh tokens rotate on every use, so a local refresh with a copy of production's row logs production out. Use this whenever `supermarket_login` holds production's current token; live calls then work until the access token expires. All three dev-only overrides live in [config/runtime.exs](config/runtime.exs).
- Capturing traffic, comparing Picape with the supermarket's iOS app, and extracting a fresh refresh token: use the `proxyman-capture` skill in [.claude/skills/proxyman-capture/SKILL.md](.claude/skills/proxyman-capture/SKILL.md). Its `scripts/capture.sh` wraps `proxyman-cli` and prints summaries without headers or bodies.

Other:
- `mix ecto.reset` — drop, create, migrate and seed. `PICAPE_DB=picape_e2e` targets the e2e database.
- `mix test path/to/file.exs:LINE` — single test. Tests start the supermarket fake on :4021 in `test/test_helper.exs`.
- `mix graphql.schema` — writes the schema SDL to `priv/graphql/schema.graphql`. A test fails when that file is stale, and the frontend GraphQL check reads it, so run this after every schema change and commit the result.
- `bin/setup` — first-time bootstrap.

Credentials live in `config/dev.secret.exs` (gitignored, optional: the fake stack boots without it) and `config/runtime.exs` via env vars (`NEW_RELIC_LICENSE_KEY`, `SENTRY_DSN`, supermarket auth). Don't commit those.

## Deploy

GitHub Actions deploys. [ci.yml](.github/workflows/ci.yml) runs the backend check, the frontend check and the screen tests (with `E2E_SKIP_SCREENSHOTS=1`, screenshots uploaded as the `e2e-output` artifact) on every push and pull request. [deploy.yml](.github/workflows/deploy.yml) runs `flyctl deploy --remote-only` after CI succeeds on `master`. It needs the `FLY_API_TOKEN` repository secret in the GitHub repo settings. `fly deploy` from your machine still works but skips the checks.

Inspecting production with `fly`: only read commands, `fly status`, `fly releases`, `fly logs --no-tail`, `fly machine list`, `fly checks list`, `fly config show`. Never `fly deploy`, `fly secrets`, `fly ssh`, `fly scale`, `fly machine` changes, `fly apps destroy` or `fly pg` from an agent session; deploys go through GitHub. The token the agent uses should be a read-only org token (`fly tokens create readonly -x 8760h`) so the API refuses writes regardless of the command; `fly tokens debug` shows `IsUser` for a full login token.

## Architecture

Phoenix 1.6 app split the conventional way:

- `lib/picape/` — domain contexts (no web concerns)
- `lib/picape_web/` — Phoenix endpoint, router, controllers, and the Absinthe GraphQL layer
- `frontend/` — Expo/React Native client (current)
- `assets/` — legacy Next.js bundle; the dev watcher in [config/dev.exs](config/dev.exs) only spawns it when `assets/node_modules` exists
- `e2e/` — Playwright screen tests and `probe.js`, own `package.json` so it survives Expo upgrades

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
- `priv/graphql/schema.graphql` is the committed SDL. `test/graphql/schema_sdl_test.exs` keeps it in sync and `frontend/scripts/check-operations.js` validates the client's operations against it.

### Frontend

`frontend/` is the active client (Expo SDK 47, React Navigation 5, Apollo Client 3, Absinthe socket link for subscriptions). All GraphQL traffic goes over the Phoenix socket, so look at websocket frames, not HTTP, when debugging queries. It is deployed as a PWA and opened on an iPhone, so follow iOS design language.

### Test data

- `priv/repo/seeds.exs` is the e2e dataset. `bin/phx --fake` loads it into `picape_e2e`, and the Playwright screenshots depend on it. The plan screen groups recipes by ingredient names such as `rijst`, `pasta` and `wrap`, so keep those names Dutch.
- `test/fixtures/supermarket/*.json` are synthetic supermarket responses in the shape the code reads. `basket.json` product ids match the seeded essentials so the shop tab shows named ingredients.

## Conventions worth knowing

- `test/support` is compiled in every env: `elixirc_paths/1` in [mix.exs](mix.exs) lists `test` for non-test envs too, and the Dockerfile never copies `test/`, so the release stays clean. Seeds use `Picape.Factory` from there, and `bin/supermarket-fake` and `bin/supermarket-snapshot` use `Picape.SupermarketFake` and `Picape.SupermarketSnapshot`. Shared test helpers go there.
- `lib/picape/supermarket.ex` has `IO.inspect` calls in `process_request_url/1` and `process_response_status_code/1` that log every outbound HTTP call. They're intentional debug hooks — don't "clean them up" without asking. `.credo.exs` excludes that file from the `IoInspect` check for this reason.
- `lib/picape/supermarket_old.ex` and `supermarket/search_result_old.ex` are kept around for reference from the pre-v4 supermarket API. Don't extend them; add to the current versions. Credo skips them.
- The supermarket client expects `X-Correlation-Id` headers and a Bearer token managed by `KeepLogin`. If you add a new endpoint, route it through `get!/put!/post!` on the `Picape.Supermarket` module so it inherits the auth + encoding pipeline, and add a matching route to `Picape.SupermarketFake`.
- Don't write project notes to agent memory. Put them in this file.

## Known gaps in the gate

- ESLint runs `react-hooks/rules-of-hooks` as a warning because seven screens call hooks after an early return. Fix those before you turn it back into an error.
- The GraphQL check skips `OverlappingFieldsCanBeMergedRule` because `SearchIngredients` aliases `searchIngredient` and `searchSupermarket` to the same name behind `@skip`/`@include`. Give them different aliases, then enable the rule.
- Screenshot comparison runs only on macOS. CI runs the screen tests without comparison.

## Troubleshooting

- `module Sentry.Plug is not loaded` or `PicapeWeb.Router.Helpers is not loaded` at compile: the `_build/<env>` cache compiled Sentry before Plug. Delete that `_build/<env>` directory and compile again.
- Blank white app in the browser: run `bin/web-probe`. A `Module build failed ... ENOENT` page error means `frontend/node_modules` is incomplete; run `npm ci` in `frontend/` and restart Expo.
- `bin/e2e` fails every test on the cart badge: Phoenix or the fake is not the one you think. `bin/status` shows what is up; kill stale processes on :4010 and :4020 and rerun so Playwright starts fresh ones.
- `bin/supermarket-snapshot` returns 401 on the token refresh: the local refresh token is dead. Get a new one with the `proxyman-capture` skill. Use one token in one place only; refresh tokens rotate on use, so sharing one between production and your machine logs one of them out.
- Expo prints "Waiting on http://localhost:<port>" for the Metro port, but the web app is always on :19006.
