#!/bin/bash
# Быстрый деплой на VPS (Docker layer cache включён).
# Запуск на сервере после загрузки /tmp/lms-deploy.tgz:
#   bash deploy/vps-deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/garpium-lms}"
ARCHIVE="${ARCHIVE:-/tmp/lms-deploy.tgz}"
COMPOSE_FILE="${COMPOSE_FILE:-deploy/docker-compose.vps.yml}"

cd "$APP_DIR"

if [[ -f deploy/.env.production ]]; then
  cp deploy/.env.production /tmp/.env.production.bak
fi

tar -xzf "$ARCHIVE"

if [[ -f /tmp/.env.production.bak ]]; then
  cp /tmp/.env.production.bak deploy/.env.production
fi

# Удаляем устаревшие файлы, если остались от прошлых деплоев
rm -rf android flutter_app ios
rm -f capacitor.config.ts
rm -rf 'src/app/api/register/company'
rm -f 'src/app/(auth)/company/page.tsx' 'src/app/(auth)/login/LoginClient.tsx'
rm -rf 'src/app/(course)/mobile'

export DOCKER_BUILDKIT=1
docker compose -f "$COMPOSE_FILE" build app
docker compose -f "$COMPOSE_FILE" up -d --force-recreate app

echo "DEPLOY_OK $(date -Iseconds)"
