#!/bin/bash
# Получить SSL и включить HTTPS
set -euo pipefail

DOMAIN="${1:-lms.garpium.com}"
EMAIL="${2:-admin@garpium.com}"
APP_DIR="/opt/garpium-lms"

cd "$APP_DIR"

docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email

cp -f deploy/nginx/lms.conf deploy/nginx/active.conf
sed -i "s/lms.garpium.com/${DOMAIN}/g" deploy/nginx/active.conf

docker compose -f docker-compose.prod.yml restart nginx

echo "SSL включён: https://${DOMAIN}"
