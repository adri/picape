# AGENTS.md

Guidance for coding agents working in this repository. Everything project specific that an agent must remember lives here, not in agent memory.

## Commands

Use Mix directly in the repo root. The `bin/` scripts wrap multi-process work. Tool versions are pinned in `.tool-versions` (Erlang, Elixir, Node 20.20.2) and read by asdf and CI; the Dockerfile hardcodes the same versions in its `ARG` lines, keep them in sync. A Homebrew `node` or `elixir` earlier in `PATH` wins over the asdf shim; check `node --version` prints 20.20.2 and `elixir --version` prints 1.20.4 before you trust a result. The `bin/` scripts source [bin/_toolchain](bin/_toolchain), which puts the asdf shims first for you, so prefer them over a bare `mix` when your own `PATH` is wrong. `bin/deploy`, `bin/setup` and `bin/update` do not source it yet. `bin/db-restore` and `bin/status` do not either, but they run neither node nor mix.

Checks (run all three before you report a change as done):
- `mix check` — backend gate, runs in the test env: `format --check-formatted`, `credo --strict`, `compile --force --warnings-as-errors`, `mix test --warnings-as-errors`, `mix sobelow`. Needs Postgres: `docker compose up -d postgres`.
- `cd frontend && npm run check` — ESLint (`universe/native`), Prettier check, `npm run graphql:check` (validates every `gql` document against `priv/graphql/schema.graphql`), Jest. `npm run format` fixes formatting. Use npm, not yarn: `package-lock.json` is the lockfile the Dockerfile and CI use. Never run `npm ci --dry-run`; with npm 8 it deletes `node_modules` without reinstalling. If you ever regenerate the lockfile, delete it first and rebuild it with `npm install --package-lock-only --lockfile-version=3`, then check that `node_modules/lightningcss-linux-x64-gnu` has an entry. A plain `npm install` prunes the native binaries for every platform but your own, and Metro needs lightningcss to transform CSS, so a Mac-pruned lockfile passes the frontend check and then fails the screen tests on CI with `Cannot find module '../lightningcss.linux-x64-gnu.node'`.
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

MCP server:
- `POST http://localhost:4010/mcp` — mounted in the router, so it is up whenever Phoenix is, on that process's database and supermarket. Add it with `claude mcp add --transport http picape http://localhost:4010/mcp`; see [the README](README.md#mcp-server) for the tool list. To poke at it by hand: `curl -s localhost:4010/mcp -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`. There is no stdio transport any more, so no `bin/mcp`, no `mix mcp` and no `PICAPE_MCP` flag.

Other:
- `mix ecto.reset` — drop, create, migrate and seed. `PICAPE_DB=picape_e2e` targets the e2e database.
- `mix test path/to/file.exs:LINE` — single test. Tests start the supermarket fake on :4021 in `test/test_helper.exs`.
- `mix graphql.schema` — writes the schema SDL to `priv/graphql/schema.graphql`. A test fails when that file is stale, and the frontend GraphQL check reads it, so run this after every schema change and commit the result.
- `bin/setup` — first-time bootstrap.

Credentials live in `config/dev.secret.exs` (gitignored, optional: the fake stack boots without it) and `config/runtime.exs` via env vars (`NEW_RELIC_LICENSE_KEY`, `SENTRY_DSN`, supermarket auth). Don't commit those.

## Deploy

GitHub Actions deploys. [ci.yml](.github/workflows/ci.yml) runs the backend check, the frontend check and the screen tests (with `E2E_SKIP_SCREENSHOTS=1`, screenshots uploaded as the `e2e-output` artifact) on every push and pull request. [deploy.yml](.github/workflows/deploy.yml) runs `flyctl deploy --remote-only` after CI succeeds on `master`. It needs the `FLY_API_TOKEN` repository secret in the GitHub repo settings. `fly deploy` from your machine still works but skips the checks.

Sentry reports errors only where `SENTRY_DSN` is set, which [config/runtime.exs](config/runtime.exs) does for `:prod` alone. There is no environment allowlist any more. The [Dockerfile](Dockerfile) runs `mix sentry.package_source_code` before `mix release`; drop that step and Sentry stack traces lose their code snippets. `Sentry.PlugCapture` sits at the top of [the endpoint](lib/picape_web/endpoint.ex) and `Sentry.PlugContext` just before the router, so the router itself needs no Sentry plug.

Inspecting production with `fly`: only read commands, `fly status`, `fly releases`, `fly logs --no-tail`, `fly machine list`, `fly checks list`, `fly config show`. Never `fly deploy`, `fly secrets`, `fly ssh`, `fly scale`, `fly machine` changes, `fly apps destroy` or `fly pg` from an agent session; deploys go through GitHub. The token the agent uses should be a read-only org token (`fly tokens create readonly -x 8760h`) so the API refuses writes regardless of the command; `fly tokens debug` shows `IsUser` for a full login token.

## Architecture

Phoenix 1.8 app split the conventional way:

- `lib/picape/` — domain contexts (no web concerns)
- `lib/picape_web/` — Phoenix endpoint, router, controllers, and the Absinthe GraphQL layer
- `frontend/` — Expo/React Native client (current)
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

### MCP server (`lib/picape/mcp.ex`, `lib/picape/mcp/tools.ex`)

Three files, no MCP dependency. The protocol subset a tool-only server needs is `initialize`, `tools/list` and `tools/call`, so [mcp.ex](lib/picape/mcp.ex) frames JSON-RPC itself and [mcp/tools.ex](lib/picape/mcp/tools.ex) holds the eleven tools. [mcp_controller.ex](lib/picape_web/controllers/mcp_controller.ex) is the transport, mounted at `POST /mcp`. `anubis_mcp` (formerly `hermes_mcp`) is the maintained Elixir SDK if this ever needs resources, prompts or sampling; it is LGPL-3.0 and wants a module per tool.

- The tools call the `Picape.*` contexts, never Absinthe, and use plain database IDs. They hardcode order id `"1"` the way `PicapeWeb.Graphql.Resolver.Order` does.
- `Picape.MCP.Tools.call/2` rescues everything, so a bad argument ends one tool call instead of the request. Domain failures come back as `{:error, message}` and reach the client as an MCP tool error, not a JSON-RPC error.
- **Stateless, and that is the whole design.** Streamable HTTP revision `2026-07-28` dropped protocol sessions and the `initialize` handshake outright; `2025-11-25`, which Claude Code still speaks, only ever made `Mcp-Session-Id` a server **MAY**. So the endpoint never mints a session id, holds no per-connection process and needs no cleanup, and a redeploy or a second machine costs nothing. Do not add a session store.
- No SSE. A request gets one JSON object back, a notification gets `202`, and GET or DELETE on `/mcp` gets `405`, which is what the spec asks of a server that offers no stream. The `match(:*, "/mcp", ...)` route in [router.ex](lib/picape_web/router.ex) exists for that `405`; Phoenix would otherwise 404.
- `initialize` answers with protocol version `2025-11-25`. Bump it in `Picape.MCP` when the client you care about negotiates something else.
- The controller rejects any request that carries an `Origin` header, with `403`. The spec makes Origin validation mandatory against DNS rebinding, and MCP clients are not browsers and send no Origin, so "any Origin is invalid" needs no list of hosts. It is not authentication: the endpoint is as open to a non-browser caller as `/graphql` already is.

### Frontend

`frontend/` is the active client (Expo SDK 57, React 19, React Navigation 6, Apollo Client 3). All GraphQL traffic goes over the Phoenix socket, so look at websocket frames, not HTTP, when debugging queries. It is deployed as a PWA and opened on an iPhone, so follow iOS design language.

The bundler is Metro, for both dev and the web export. Webpack is gone, and with it `webpack.config.js` and `web/index.html`. What replaced each piece:

- `frontend/index.js` is the entry point, set as `main` in `package.json`. It imports `@expo/metro-runtime` before `registerRootComponent`. Without that import the export builds but the page stays blank.
- `frontend/public/` holds everything webpack used to template: `index.html`, `manifest.json`, the favicons, `pwa/`, `serve.json` and `robots.txt`. Expo copies the directory into the export as is, so the placeholders webpack substituted (`%PUBLIC_URL%` and friends) are resolved in the committed file. `PUBLIC_URL` no longer exists in the bundle; [src/serviceWorkerRegistration.js](frontend/src/serviceWorkerRegistration.js) hardcodes the empty string for it.
- `npm run build:web` runs `expo export --platform web` into `frontend/dist`, then `node scripts/build-service-worker.js`. That script calls workbox-build's `generateSW` in place of the old `workbox-webpack-plugin` `InjectManifest`, which only worked inside webpack. It must emit one self-contained classic worker (`inlineWorkboxRuntime: true`); the default split runtime needs `{type: 'module'}` registration, which the app does not use.
- [the endpoint](lib/picape_web/endpoint.ex) serves the export, so `Plug.Static`'s `only` list has to name every top-level file and directory the export produces. Add a file to `frontend/public/` and it 404s in production until that list names it too.
- Jest uses the `jest-expo/web` preset with `jest-environment-jsdom`. The native preset breaks on react-native-web 0.20. Component tests render with `react-dom`, not `react-test-renderer`, whose `toJSON` returns null for react-native-web output.
- [src/absintheSocketLink.js](frontend/src/absintheSocketLink.js) is the Apollo link, written to replace the abandoned `@absinthe/socket-apollo-link`. Two things about it are easy to break. Subscription payloads arrive on `socket.onMessage`, not on a `channel.on` handler, because absinthe_phoenix pushes `subscription:data` to the socket rather than the control topic; and that listener has to be registered once per link, because phoenix invokes every listener it holds. Absinthe also drops a subscription when its channel process exits, so the link re-pushes every active document on `socket.onOpen`. Without that, subscriptions go quiet for good after any reconnect and nothing reports an error. To check it, drop the socket for real by restarting Phoenix; `BrowserContext.setOffline` does not close an open websocket, so a test built on it passes either way.
- [components/Skeleton/SkeletonContent.js](frontend/components/Skeleton/SkeletonContent.js) replaces `react-native-skeleton-content`, which pulls react-native-reanimated 2.1.0 and calls the `findNodeHandle` that react-native-web 0.20 removed.

Expo inlines `process.env.EXPO_PUBLIC_*` from dotenv files only, not from the shell environment; passing one on the command line to `expo export` leaves the reference `undefined`. So the socket host in [App.js](frontend/App.js) is a plain `__DEV__` conditional. To exercise a production bundle against the local backend, edit that line, build, and revert it.

### Test data

- `priv/repo/seeds.exs` is the e2e dataset. `bin/phx --fake` loads it into `picape_e2e`, and the Playwright screenshots depend on it. The plan screen groups recipes by ingredient names such as `rijst`, `pasta` and `wrap`, so keep those names Dutch.
- `test/fixtures/supermarket/*.json` are supermarket responses in the shape the code reads. `basket.json` and `search.json` are synthetic; `basket.json` product ids match the seeded essentials so the shop tab shows named ingredients. The `product_*.json` are verbatim `productCard` objects recorded from production, with only `webshopId` and `hqId` rewritten to the id in the filename, so a screen built against the fake sees the fields production actually sends. Write a hand-made product fixture and you get a shape the code does not read: the old ones carried `nutriscore` and `orderable` at the top of the card, where production sends `properties.nutriscore[0]`, `isOrderable` and `orderAvailabilityStatus`.

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
- `expo-doctor` reports one failure: `sentry-expo` nests its own react 18 next to the project's react 19. It only matters for native builds, and this app ships web, where [Sentry.web.js](frontend/Sentry.web.js) uses `@sentry/browser` and the `sentry-expo` path is never bundled. Clearing it means migrating [Sentry.native.js](frontend/Sentry.native.js) to `@sentry/react-native`, which nothing here can test.
- `npm audit` reports 22 moderate advisories, all in build-time dependency trees. High and critical are at zero; keep it that way.
- The recipe detail screenshot contains a hero image from `githubusercontent.com`. The e2e `beforeEach` aborts every non-localhost request so the baseline stays deterministic, and the baseline is therefore the blank-hero render. A service worker bypasses Playwright's request interception, so add `serviceWorkers: 'block'` when pointing the suite at a production export, or the image loads and the screenshot fails.

## Troubleshooting

- `module Sentry.PlugCapture is not loaded` or `PicapeWeb.Router.Helpers is not loaded` at compile: the `_build/<env>` cache compiled Sentry before Plug. Delete that `_build/<env>` directory and compile again. CI can hit this too now that its mix caches carry `restore-keys`: a `mix.lock` bump reuses the previous `_build` instead of building clean. A `.tool-versions` change is always cold, because its hash sits in the restore-key prefix. To force a cold build after a lockfile bump, change the `mix-test-`/`mix-dev-` prefix in [ci.yml](.github/workflows/ci.yml).
- Blank white app in the browser: run `bin/web-probe`. A `Module build failed ... ENOENT` page error means `frontend/node_modules` is incomplete; run `npm ci` in `frontend/` and restart Expo.
- `bin/e2e` fails every test on the cart badge: Phoenix or the fake is not the one you think. `bin/status` shows what is up; kill stale processes on :4010 and :4020 and rerun so Playwright starts fresh ones.
- `bin/supermarket-snapshot` returns 401 on the token refresh: the local refresh token is dead. Get a new one with the `proxyman-capture` skill. Use one token in one place only; refresh tokens rotate on use, so sharing one between production and your machine logs one of them out.
- Expo prints "Waiting on http://localhost:<port>" for the Metro port, but the web app is always on :19006.
- `Timed out joining __absinthe__:control` in a page you built yourself: the bundle is pointing at production. `__DEV__` is false in an export, so the socket host in [App.js](frontend/App.js) resolves to `wss://picape.whybug.com/socket`. Grep the bundle in `frontend/dist/_expo/static/js/web/` for the URL before you debug the link.
- `The database for Picape.Repo couldn't be dropped ... is being accessed by other users` from `bin/phx --fake`: a stale Phoenix from an earlier session still holds connections to `picape_e2e`. `pgrep -fl beam.smp` shows them with their start time; kill the old one. The script then boots, but until you do, port 4010 is served by whatever was already there, which is a good way to test the wrong code for an hour.
- Service worker registration fails in the built-in browser pane with "An unknown error occurred when fetching the script", including for a trivial one-line worker. It is the pane, not the build. Playwright's Chromium registers and activates the same worker and precaches all 33 files, so verify the PWA there.
