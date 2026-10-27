#!/usr/bin/env bash
# Local deployment for MaMaisonQC.
# Usage: scripts/serve.sh [port] [--lan]   (default 3300 — verify it is free first)
#   --lan  bind 0.0.0.0 so a phone on the same Wi-Fi can reach the app (prints the LAN URL)
# Stop:  scripts/serve.sh stop
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${1:-3300}"
BIND="127.0.0.1"
if [ "${2:-}" = "--lan" ] || [ "${1:-}" = "--lan" ]; then
  BIND="0.0.0.0"
fi
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

nohup npm start -- --port "$PORT" --hostname "$BIND" > "$LOG" 2>&1 &
echo $! > "$PIDFILE"
sleep 6
if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/api/health"; then
  echo "running: http://127.0.0.1:$PORT  (log: $LOG, pid: $(cat "$PIDFILE"))"
  if [ "$BIND" = "0.0.0.0" ]; then
    for IFACE in en0 en1; do
      IP=$(ipconfig getifaddr "$IFACE" 2>/dev/null || true)
      [ -n "$IP" ] && echo "LAN:     http://$IP:$PORT   (same Wi-Fi, phone browser)"
    done
  fi
else
  echo "failed to start — see $LOG"; tail -20 "$LOG"; exit 1
fi
