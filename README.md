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

See [AGENTS.md](AGENTS.md) for the full harness.

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
