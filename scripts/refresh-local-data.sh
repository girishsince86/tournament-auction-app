#!/usr/bin/env bash
set -euo pipefail

# Refresh local Supabase DB with fresh data from remote.
# Truncates all local public tables, then restores from a fresh dump.
# Usage:
#   SUPABASE_DB_PASSWORD=yourpass ./scripts/refresh-local-data.sh

# ── Config ──────────────────────────────────────────────────
LOCAL_DB_HOST="127.0.0.1"
LOCAL_DB_PORT=54322
LOCAL_DB_USER="postgres"
LOCAL_DB_PASS="postgres"

DUMP_FILE="data_dump.sql"

# ── Prompt for remote DB password ───────────────────────────
if [ -z "${SUPABASE_DB_PASSWORD:-}" ]; then
  echo "Enter remote Supabase DB password:"
  read -s SUPABASE_DB_PASSWORD
  echo ""
fi
export SUPABASE_DB_PASSWORD

# ── Verify local Supabase is running ────────────────────────
if ! supabase status &>/dev/null; then
  echo "Error: Local Supabase is not running. Run 'supabase start' first."
  exit 1
fi

# ── Dump remote data using supabase CLI ─────────────────────
echo "==> Dumping remote data..."
supabase db dump --data-only --schema public -f "$DUMP_FILE"

DUMP_SIZE=$(wc -c < "$DUMP_FILE" | tr -d ' ')
echo "    Dump: ${DUMP_SIZE} bytes"

# ── Truncate local tables then restore ──────────────────────
echo "==> Clearing local data..."
PGPASSWORD="$LOCAL_DB_PASS" psql \
  -h "$LOCAL_DB_HOST" \
  -p "$LOCAL_DB_PORT" \
  -U "$LOCAL_DB_USER" \
  -d postgres \
  -c "DO \$\$ DECLARE r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
        LOOP
          EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END \$\$;"

echo "==> Restoring fresh data..."
PGPASSWORD="$LOCAL_DB_PASS" psql \
  -h "$LOCAL_DB_HOST" \
  -p "$LOCAL_DB_PORT" \
  -U "$LOCAL_DB_USER" \
  -d postgres \
  -f "$DUMP_FILE" \
  --quiet 2>&1 | grep -v "^ERROR" || true

echo "    Data refresh complete."

# ── Verify ──────────────────────────────────────────────────
echo ""
echo "==> Verifying local data..."
PGPASSWORD="$LOCAL_DB_PASS" psql \
  -h "$LOCAL_DB_HOST" \
  -p "$LOCAL_DB_PORT" \
  -U "$LOCAL_DB_USER" \
  -d postgres \
  -c "SELECT 'tournaments' as table_name, count(*) FROM tournaments
      UNION ALL SELECT 'players', count(*) FROM players
      UNION ALL SELECT 'teams', count(*) FROM teams
      UNION ALL SELECT 'tournament_registrations', count(*) FROM tournament_registrations;"
