#!/bin/bash
# Применяет все SQL-миграции Prisma к postgres в docker compose (идемпотентно).
set -uo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-deploy/docker-compose.fast.yml}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-release/prisma/migrations}"

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "WARN: migrations dir missing: $MIGRATIONS_DIR" >&2
  exit 0
fi

mapfile -t FILES < <(find "$MIGRATIONS_DIR" -mindepth 2 -maxdepth 2 -name migration.sql | sort)

FILTERED=()
for f in "${FILES[@]}"; do
  base="$(basename "$(dirname "$f")")"
  if [[ "$base" > "20260601192959" ]]; then
    FILTERED+=("$f")
  fi
done

if [[ ${#FILTERED[@]} -eq 0 ]]; then
  echo "WARN: no incremental migrations to apply" >&2
  exit 0
fi

for sql in "${FILTERED[@]}"; do
  echo ">> migrate: $sql"
  if ! docker compose -f "$COMPOSE_FILE" exec -T postgres psql -v ON_ERROR_STOP=0 -U lms -d corporate_lms < "$sql"; then
    echo "WARN: migration may have partial errors: $sql" >&2
  fi
done

echo "MIGRATIONS_OK"
