#!/usr/bin/env bash
set -euo pipefail

echo "[INFO] Checking prerequisites..."

if ! command -v docker >/dev/null 2>&1; then
  echo "[ERROR] Docker is not installed."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "[ERROR] Docker Compose is not installed."
  exit 1
fi

echo "[INFO] Cleaning previous state..."
$COMPOSE down -v

echo "[INFO] Building & launching..."
$COMPOSE up --build -d

echo "[INFO] Waiting for containers to become healthy..."
# Wait up to ~120s
for i in {1..60}; do
  unhealthy="$($COMPOSE ps --format json | grep -E '"Health":"unhealthy"' || true)"
  starting="$($COMPOSE ps --format json | grep -E '"Health":"starting"' || true)"

  if [[ -z "$unhealthy" && -z "$starting" ]]; then
    break
  fi
  sleep 2
done

# Final check
if $COMPOSE ps | grep -q "unhealthy"; then
  echo "[ERROR] One or more containers are unhealthy."
  $COMPOSE ps
  exit 1
fi

echo "[SUCCESS] Application is live at http://localhost"
