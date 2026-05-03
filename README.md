# Picape
[![CircleCI](https://circleci.com/gh/adri/picape.svg?style=svg)](https://circleci.com/gh/adri/picape) [![codecov](https://codecov.io/gh/adri/picape/branch/master/graph/badge.svg)](https://codecov.io/gh/adri/picape)

Supermarket meets recipes.

## Setup
```
$ cd picape
$ bin/setup
```

## Scripts
- `bin/setup`: Install all dependencies and run tests. Use this on your CI server.
- `bin/update`: Update all dependencies, after pulling or merging.
- `bin/ci`: Run this locally to run all commands run by CI.
- `mix phx.server`: Start Phoenix server.
- `mix ecto.reset`: Drop and reseed the database.
- `mix test`: Run the Elixir tests.
- `cd frontend/ && yarn test`: Run Javascript tests.

## Development
- Web: http://localhost:4001
- API: http://localhost:4010/graphql
- GraphiQL: http://localhost:4010/graphiql

## Deploy
Hosted on [Fly.io](https://fly.io/) — config in [fly.toml](fly.toml), image built from the [Dockerfile](Dockerfile).
```
fly deploy
```

## Screenshots
![picape whybug com- ipad pro](https://user-images.githubusercontent.com/133832/29629508-6650bcd2-8839-11e7-84a8-12fc94d230f9.png)
[picapie-unplan](https://user-images.githubusercontent.com/133832/28908720-684074fc-7825-11e7-9da7-cfac3ea25066.gif)
[picapie-essentials](https://user-images.githubusercontent.com/133832/28908719-683ff64e-7825-11e7-8a80-88af9bfdcdaf.gif)

Generated using the [Firebird](https://github.com/infinitered/firebird) template.
