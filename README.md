# Picape

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
- `bin/heroku_compile_assets`: Compile assets on Heroku for production.
- `mix phx.server`: Start Phoenix server.
- `mix ecto.reset`: Drop and reseed the database.
- `mix test`: Run the Elixir tests.
- `cd assets/ && yarn run test`: Run Javascript tests.

## Deploy

```
$ heroku create
$ heroku buildpacks:set https://github.com/HashNuke/heroku-buildpack-elixir
$ heroku buildpacks:add https://github.com/gjaldon/heroku-buildpack-phoenix-static
$ git push heroku master
```

## Screenshots
![picapie-unplan](https://user-images.githubusercontent.com/133832/28908720-684074fc-7825-11e7-9da7-cfac3ea25066.gif)
![picapie-essentials](https://user-images.githubusercontent.com/133832/28908719-683ff64e-7825-11e7-8a80-88af9bfdcdaf.gif)

Generated using the [Firebird](https://github.com/infinitered/firebird) template.
