#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/code/literatureSearch"
HOST="${LITERATURE_SEARCH_HOST:-127.0.0.1}"
PORT="${LITERATURE_SEARCH_PORT:-3000}"
URL="http://localhost:$PORT"
TMP_DIR="$ROOT_DIR/.codex/tmp"
LOG_FILE="$TMP_DIR/literature-search-dev.log"
PID_FILE="$TMP_DIR/literature-search-dev.pid"

mkdir -p "$TMP_DIR"

if [[ ! -d "$APP_DIR" ]]; then
  echo "App directory not found: $APP_DIR" >&2
  exit 1
fi

cd "$APP_DIR"

if [[ ! -d node_modules ]]; then
  npm install
fi

if [[ -f "$PID_FILE" ]]; then
  EXISTING_PID="$(cat "$PID_FILE")"
  if kill -0 "$EXISTING_PID" >/dev/null 2>&1; then
    open "$URL"
    echo "Literature Search already running at $URL"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $PORT is already in use. Set LITERATURE_SEARCH_PORT to an open port and retry." >&2
  exit 1
fi

nohup bash -lc "cd \"$APP_DIR\" && exec npm run dev -- --hostname \"$HOST\" --port \"$PORT\"" \
  >"$LOG_FILE" 2>&1 < /dev/null &
SERVER_PID="$!"
disown "$SERVER_PID" 2>/dev/null || true
echo "$SERVER_PID" > "$PID_FILE"

for _ in {1..30}; do
  if curl -fsS "$URL" >/dev/null 2>&1; then
    open "$URL"
    echo "Literature Search running at $URL"
    exit 0
  fi
  sleep 1
done

echo "Dev server did not become ready within 30 seconds." >&2
echo "Check the log at $LOG_FILE" >&2
exit 1
