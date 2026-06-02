#!/bin/bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/garpium-lms}"
ARCHIVE="${ARCHIVE:-/tmp/lms-fast.tgz}"
COMPOSE_FILE="${COMPOSE_FILE:-deploy/docker-compose.fast.yml}"

cd "$APP_DIR"

if [[ -f deploy/.env.production ]]; then
  cp deploy/.env.production /tmp/.env.production.bak
fi

tar -xzf "$ARCHIVE"

if [[ -f /tmp/.env.production.bak ]]; then
  cp /tmp/.env.production.bak deploy/.env.production
fi

if [[ ! -f release/server.js ]]; then
  echo "ERROR: release/server.js not found" >&2
  exit 1
fi

export DOCKER_BUILDKIT=1
docker compose -f "$COMPOSE_FILE" build app
docker compose -f "$COMPOSE_FILE" up -d --force-recreate app

sleep 3

if [[ -f deploy/apply-migrations.sh ]]; then
  bash deploy/apply-migrations.sh
fi

login_code="$(curl -sS -o /dev/null -w '%{http_code}' https://lms.garpium.com/login || echo 000)"
echo "login:${login_code}"

echo "FAST_DEPLOY_OK $(date -Iseconds)"
