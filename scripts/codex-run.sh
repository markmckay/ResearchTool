#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/code/literatureSearch"
HOST="${LITERATURE_SEARCH_HOST:-0.0.0.0}"
PORT="${LITERATURE_SEARCH_PORT:-3000}"
URL="http://localhost:$PORT"
TMP_DIR="$ROOT_DIR/.codex/tmp"
LOG_FILE="$TMP_DIR/literature-search-run.log"

mkdir -p "$TMP_DIR"

if [[ ! -d "$APP_DIR" ]]; then
  echo "App directory not found: $APP_DIR" >&2
  exit 1
fi

cd "$APP_DIR"

if [[ ! -d node_modules ]]; then
  npm install
fi

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  if curl -fsS "$URL" >/dev/null 2>&1; then
    open "$URL"
    echo "Literature Search already running at $URL"
    exit 0
  fi
  STALE_PID="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN | head -n 1)"
  if [[ -n "$STALE_PID" ]]; then
    kill "$STALE_PID" >/dev/null 2>&1 || true
    sleep 1
  else
    echo "Port $PORT is already in use. Set LITERATURE_SEARCH_PORT to an open port and retry." >&2
    exit 1
  fi
fi

osascript <<APPLESCRIPT >/dev/null
tell application "Terminal"
  activate
  do script "cd \"$APP_DIR\"; clear; npm run build && npm run start -- --hostname \"$HOST\" --port \"$PORT\" 2>&1 | tee \"$LOG_FILE\""
end tell
APPLESCRIPT

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
