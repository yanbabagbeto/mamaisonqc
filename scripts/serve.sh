#!/usr/bin/env bash
# Local deployment for MaMaisonQC.
# Usage: scripts/serve.sh [port]      (default 3300 — verify it is free first)
# Stop:  scripts/serve.sh stop
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${1:-3300}"
PIDFILE=".serve.pid"
LOG="serve.log"

if [ "${1:-}" = "stop" ]; then
  if [ -f "$PIDFILE" ]; then kill "$(cat "$PIDFILE")" 2>/dev/null || true; rm -f "$PIDFILE"; echo "stopped"; else echo "not running"; fi
  exit 0
fi

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "port $PORT is already in use — pick another: scripts/serve.sh 3301"; exit 1
fi
if [ ! -f data/mamaisonqc.db ]; then
  echo "no database: run npm run db:migrate && npm run db:seed first"; exit 1
fi
if [ ! -f .next/BUILD_ID ]; then
  echo "no production build: run npm run build first"; exit 1
fi

nohup npm start -- --port "$PORT" --hostname 127.0.0.1 > "$LOG" 2>&1 &
echo $! > "$PIDFILE"
sleep 6
if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/api/health"; then
  echo "running: http://127.0.0.1:$PORT  (log: $LOG, pid: $(cat "$PIDFILE"))"
else
  echo "failed to start — see $LOG"; tail -20 "$LOG"; exit 1
fi
