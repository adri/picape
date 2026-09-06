# Picape
[![CircleCI](https://circleci.com/gh/adri/picape.svg?style=svg)](https://circleci.com/gh/adri/picape) [![codecov](https://codecov.io/gh/adri/picape/branch/master/graph/badge.svg)](https://codecov.io/gh/adri/picape)

Supermarket meets recipes.

## Setup
```
$ cd picape
$ bin/setup
```

## Scripts
- `bin/setup`: Install all dependencies and run the checks.
- `mix check`: Backend checks (format, credo, compile warnings, tests, sobelow).
- `cd frontend && npm run check`: Frontend checks (ESLint, Prettier, Jest).
- `bin/e2e`: Playwright screen tests on an iPhone profile against the fake stack.
- `bin/phx` / `bin/phx --fake`: Phoenix against your data and the live supermarket API, or against the seeded e2e database and the supermarket fake.
- `bin/supermarket-fake`, `bin/supermarket-snapshot`: Run the supermarket stand-in, or record fixtures from the live API.
- `bin/ci`: Everything GitHub Actions runs.

## Development
- Web: http://localhost:19006 (`cd frontend && npm run web`)
- API: http://localhost:4010/graphql
- GraphiQL: http://localhost:4010/graphiql
- MCP: http://localhost:4010/mcp

See [AGENTS.md](AGENTS.md) for the full harness.

## MCP server
`/mcp` hands an AI agent Picape as MCP tools. It lives inside this app and calls the `Picape.*` contexts directly, so there is no second deploy and no separate build.

It is a route in the Phoenix router, so it is up whenever the app is, on the database and the supermarket that app is using. It speaks Streamable HTTP without sessions: one JSON-RPC message per POST, one response per request, nothing held open between calls.

| Tool | What it does |
| --- | --- |
| `search_ingredients` | Search the ingredients Picape knows, by name |
| `search_supermarket` | Search the supermarket's product catalogue |
| `get_shopping_list` | Read the current order: items, quantities, totals |
| `set_ingredient_quantity` | Put an ingredient on the list, change it, or remove it with quantity 0 |
| `add_ingredient` | Teach Picape an ingredient, backed by a supermarket product ID |
| `list_recipes` | List recipes, optionally filtered on title |
| `get_recipe` | Read one recipe with its ingredients |
| `add_recipe` | Create a recipe with a title |
| `edit_recipe` | Replace a recipe's title, description, image and ingredient list |
| `plan_recipe` | Plan a recipe for the current order |
| `unplan_recipe` | Take a recipe off the current order |

Start the app with `bin/phx`, then add it to Claude Code:
```
claude mcp add --transport http picape http://localhost:4010/mcp
```

To add it to Claude Desktop, put this in `~/Library/Application Support/Claude/claude_desktop_config.json` and restart the app:
```json
{
  "mcpServers": {
    "picape": { "type": "http", "url": "http://localhost:4010/mcp" }
  }
}
```

To see what it answers without a client, post a request to it:
```
curl -s localhost:4010/mcp -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Notes on the tools:
- IDs are plain database IDs, not the Relay global IDs the GraphQL API hands out. The exception is `search_supermarket`, whose `id` is a supermarket product ID meant for `add_ingredient`.
- Picape has no recipe search, so `list_recipes` fetches every recipe and filters on the title.
- Picape cannot create a recipe with its ingredients in one call. Call `add_recipe` first, then `edit_recipe`.
- `edit_recipe` replaces the whole ingredient list. Read the recipe first and send back every ingredient you want to keep.
- There is no delete for recipes.

## Deploy
Hosted on [Fly.io](https://fly.io/) — config in [fly.toml](fly.toml), image built from the [Dockerfile](Dockerfile).
GitHub Actions deploys `master` after CI passes ([deploy.yml](.github/workflows/deploy.yml)). It needs the `FLY_API_TOKEN` repository secret:
```
fly tokens create deploy -x 999999h | gh secret set FLY_API_TOKEN
```

## Screenshots
![picape whybug com- ipad pro](https://user-images.githubusercontent.com/133832/29629508-6650bcd2-8839-11e7-84a8-12fc94d230f9.png)
[picapie-unplan](https://user-images.githubusercontent.com/133832/28908720-684074fc-7825-11e7-9da7-cfac3ea25066.gif)
[picapie-essentials](https://user-images.githubusercontent.com/133832/28908719-683ff64e-7825-11e7-8a80-88af9bfdcdaf.gif)

Generated using the [Firebird](https://github.com/infinitered/firebird) template.
