# syntax=docker/dockerfile:experimental

# Find eligible builder and runner images on Docker Hub. We use Ubuntu/Debian instead of
# Alpine to avoid DNS resolution issues in production.
#
# https://hub.docker.com/r/hexpm/elixir/tags?page=1&name=ubuntu
# https://hub.docker.com/_/ubuntu?tab=tags
#
#
# This file is based on these images:
#
#   - https://hub.docker.com/r/hexpm/elixir/tags - for the build image
#   - https://hub.docker.com/_/debian?tab=tags&page=1&name=bullseye-20210902-slim - for the release image
#   - https://pkgs.org/ - resource for finding needed packages
#   - Ex: hexpm/elixir:1.13.2-erlang-24.2.1-debian-bullseye-20210902-slim
#
ARG BUILDER_IMAGE="hexpm/elixir:1.13.2-erlang-24.2.1-debian-bullseye-20210902-slim"
ARG RUNNER_IMAGE="debian:bullseye-20210902-slim"
ARG NODE_VERSION="7.5"

FROM ${BUILDER_IMAGE} as builder

ARG NODE_VERSION

# install build dependencies
RUN --mount=type=cache,id=apt-cache,target=/var/cache/apt,sharing=locked \
  --mount=type=cache,id=apt-lib,target=/var/lib/apt,sharing=locked \
  --mount=type=cache,id=debconf,target=/var/cache/debconf,sharing=locked \
  apt-get update -y && apt-get install -y build-essential curl git \
  && apt-get clean && rm -f /var/lib/apt/lists/*_* \
  # Install using n
  && curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o /usr/local/bin/n \
  && chmod +x /usr/local/bin/n \
  # Install lts version
  # && n lts \
  # Install specific version
  && n "$NODE_VERSION" \
  && rm /usr/local/bin/n

# prepare build dir
WORKDIR /app

# set build ENV
ENV MIX_ENV="prod"
ENV NODE_ENV="production"

COPY mix.exs mix.lock ./

# install hex + rebar + dependencies
RUN --mount=type=cache,target=~/.hex/packages/hexpm,sharing=locked \
  --mount=type=cache,target=~/.cache/rebar3,sharing=locked \
  mix do local.rebar --force, local.hex --force, deps.get --only $MIX_ENV

RUN mkdir config

# copy compile-time config files before we compile dependencies
# to ensure any relevant config change will trigger the dependencies
# to be re-compiled.
COPY config/config.exs config/${MIX_ENV}.exs config/
RUN --mount=type=cache,target=~/.hex/packages/hexpm,sharing=locked \
  --mount=type=cache,target=~/.cache/rebar3,sharing=locked \
  mix deps.compile

COPY priv priv

# note: if your project uses a tool like https://purgecss.com/,
# which customizes asset compilation based on what it finds in
# your Elixir templates, you will need to move the asset compilation
# step down so that `lib` is available.
COPY assets assets

# Build nextjs
RUN --mount=type=cache,target=~/.npm,sharing=locked \
  --mount=type=cache,target=/app/assets/node_modules,sharing=locked \
  --mount=type=cache,target=.next,sharing=locked \
  cd assets && npm install --prefer-offline --no-audit --loglevel=error \
  && HOST="picape.fly.dev" node_modules/.bin/next build \
  && cp -R node_modules /node_modules_build

# compile assets
RUN mix phx.digest

# Compile the release
COPY lib lib

RUN --mount=type=cache,target=~/.hex/packages/hexpm,sharing=locked \
  --mount=type=cache,target=~/.cache/rebar3,sharing=locked \
  mix compile

# Changes to config/runtime.exs don't require recompiling the code
COPY config/runtime.exs config/

COPY rel rel
COPY bin bin
RUN mix release

# start a new build stage so that the final image will only contain
# the compiled release and other runtime necessities
FROM ${RUNNER_IMAGE}

ARG NODE_VERSION

RUN --mount=type=cache,id=apt-cache,target=/var/cache/apt,sharing=locked \
  --mount=type=cache,id=apt-lib,target=/var/lib/apt,sharing=locked \
  --mount=type=cache,id=debconf,target=/var/cache/debconf,sharing=locked \
  apt-get update -y && apt-get install -y libstdc++6 openssl curl libncurses5 locales \
  && apt-get clean && rm -f /var/lib/apt/lists/*_* \
  # Install using n
  && curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o /usr/local/bin/n \
  && chmod +x /usr/local/bin/n \
  # Install lts version
  # && n lts \
  # Install specific version
  && n "$NODE_VERSION" \
  && rm /usr/local/bin/n

# Set the locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

WORKDIR "/app"
RUN chown nobody /app


# Only copy the final release from the build stage
COPY --from=builder --chown=nobody:root /app/_build/prod/rel/picape ./
COPY --from=builder --chown=nobody:root /app/bin ./bin
COPY --from=builder --chown=nobody:root /app/assets ./assets
COPY --from=builder --chown=nobody:root /node_modules_build ./assets/node_modules

USER nobody

CMD ["/app/bin/server"]
