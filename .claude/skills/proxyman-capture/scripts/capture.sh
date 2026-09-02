#!/usr/bin/env bash
# Thin wrapper around proxyman-cli. See ../SKILL.md.
#   capture.sh start
#   capture.sh export <domain> <file.har>
#   capture.sh summary <file.har>
#   capture.sh token <file.har>
set -euo pipefail

PROXYMAN=/Applications/Proxyman.app/Contents/MacOS/proxyman-cli
command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }
[[ -x $PROXYMAN ]] || { echo "proxyman-cli not found at $PROXYMAN; install Proxyman" >&2; exit 1; }

case "${1:-}" in
  start)
    "$PROXYMAN" proxy-host
    "$PROXYMAN" clear-session
    echo "session cleared; perform the flow, then run: capture.sh export <domain> <file.har>"
    ;;
  export)
    domain=${2:?domain}; out=${3:?output .har path}
    mkdir -p "$(dirname "$out")"
    "$PROXYMAN" export-log -m domains --domains "$domain" -o "$out" -f har
    sleep 3
    [[ -s $out ]] || { echo "export produced no file; is Proxyman running and did traffic hit $domain?" >&2; exit 1; }
    echo "$(jq '.log.entries | length' "$out") requests written to $out"
    ;;
  summary)
    file=${2:?har file}
    jq -r '.log.entries[] | [
      .request.method,
      (.request.url | sub("^https?://[^/]+"; "") | .[0:70]),
      (.response.status | tostring),
      ((.response.content.size // 0) | tostring),
      ((.request.postData.text // "") | try (fromjson | .operationName // "") catch "")
    ] | @tsv' "$file" | column -t -s $'\t'
    ;;
  token)
    file=${2:?har file}
    jq -r '.log.entries[]
      | select(.request.url | test("/mobile-auth/v1/auth/token/refresh"))
      | .response.content.text
      | try fromjson catch empty
      | select(.refresh_token != null)
      | "update supermarket_login set access_token = '"'"'\(.access_token)'"'"', refresh_token = '"'"'\(.refresh_token)'"'"', expires_in = \(.expires_in), updated_at = now();"' "$file" | tail -1
    ;;
  *)
    sed -n '2,6p' "$0"
    exit 1
    ;;
esac
