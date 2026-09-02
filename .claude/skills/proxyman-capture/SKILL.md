---
name: proxyman-capture
description: >
  Capture and inspect HTTPS traffic with the Proxyman CLI on this Mac, for
  Picape's own supermarket calls or for the supermarket's iOS app on a phone.
  Use this skill whenever the user wants to record, capture, sniff, compare or
  inspect network traffic, mentions Proxyman, a HAR file, the supermarket app's
  requests, or needs a fresh refresh token for `supermarket_login`.
---

# Proxyman capture

Two sources of traffic, one CLI. `scripts/capture.sh` wraps the CLI so a
capture is three commands and the output is a short table, not a HAR dump.

```bash
PROXYMAN=/Applications/Proxyman.app/Contents/MacOS/proxyman-cli
$PROXYMAN proxy-host          # {"ip":"192.168.x.x","port":9090}
```

Proxyman's GUI must be running. The CLI talks to the live app.

## Source 1: Picape's backend

Route Picape's supermarket calls through Proxyman with the dev switch in
`config/runtime.exs`:

```bash
SUPERMARKET_PROXY=1 bin/phx
```

The backend trusts the Proxyman CA from
`~/Library/Application Support/com.proxyman.NSProxy/app-data/proxyman-ca.pem`.
No system proxy is needed; the switch sets a hackney proxy on :9090.

## Source 2: the supermarket's iOS app on a phone

The app is App Store only, so a real iPhone on the same Wi-Fi is required.
One-time setup on the phone:

1. `Settings → Wi-Fi → (i) → Configure Proxy → Manual`, server = the `ip`
   from `proxy-host`, port 9090.
2. Safari: open `http://proxy.man/ssl`, install the profile
   (`Settings → Profile Downloaded → Install`), then enable it under
   `Settings → General → About → Certificate Trust Settings`.
3. Proxyman GUI: `Tools → SSL Proxying List`, add the API host from
   `config/dev.secret.exs` (`base_url` host) on port 443.

Remove the proxy from the phone afterwards, or the phone has no internet
when the Mac is off.

## Recording a flow

```bash
SKILL=.claude/skills/proxyman-capture/scripts/capture.sh
$SKILL start                        # clears the session
# perform the flow (in the app, or trigger it in Picape), then:
$SKILL export <api-host> tmp/capture.har
$SKILL summary tmp/capture.har      # method, path, status, size per request
```

`export` sleeps 3 seconds after the CLI returns because the file is written
asynchronously. `summary` never prints headers or bodies, so tokens stay out
of the terminal and the transcript.

## Getting a new refresh token

When `bin/supermarket-snapshot` fails with a 401 on
`/mobile-auth/v1/auth/token/refresh`, record the app while it starts, then:

```bash
$SKILL token tmp/capture.har
```

This prints only the SQL you need, with the token value already inlined, so
you can paste it into `psql` yourself. Do not commit the HAR. The refresh
token rotates on every use, so use one token in one place only: either the
production app or your local backend.

## Comparing Picape with the app

Record both into separate HAR files, then run `summary` on each. Differences
in paths, headers (`X-Application`, `X-ClientVersion`, `User-Agent`) or the
GraphQL `operationName` explain most 4xx responses from the supermarket.
Header names and values of the app live in `config/dev.secret.exs` and in
`Picape.Supermarket.process_request_headers/1`.
