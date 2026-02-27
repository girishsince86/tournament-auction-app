#!/usr/bin/env bash
set -euo pipefail

# Local Supabase setup: starts local stack, dumps remote data, restores locally.
# Usage:
#   SUPABASE_DB_PASSWORD=yourpass ./scripts/local-db-setup.sh
#   or just run it and enter the password when prompted.

# ── Config ──────────────────────────────────────────────────
LOCAL_DB_HOST="127.0.0.1"
LOCAL_DB_PORT=54322
LOCAL_DB_NAME="postgres"
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

# ── Step 1: Verify local Supabase is running ────────────────
echo "==> Checking local Supabase..."
if ! supabase status &>/dev/null; then
  echo "    Local Supabase not running. Starting..."
  supabase start
fi
echo "    Local Supabase is running."

# ── Step 2: Capture local keys and create .env.local.local ──
echo "==> Capturing local Supabase keys..."
LOCAL_ANON_KEY=$(supabase status -o env | grep "^ANON_KEY=" | cut -d= -f2- | tr -d '"')
LOCAL_SERVICE_KEY=$(supabase status -o env | grep "^SERVICE_ROLE_KEY=" | cut -d= -f2- | tr -d '"')

cat > .env.local.local <<EOF
# Local Supabase (Docker)
NEXT_PUBLIC_REGISTRATION_OPEN=false
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=${LOCAL_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${LOCAL_SERVICE_KEY}
EOF
echo "    Created .env.local.local"

# ── Step 3: Dump remote data using supabase CLI ─────────────
echo "==> Dumping remote database (data only, public schema)..."
supabase db dump --data-only --schema public -f "$DUMP_FILE"

DUMP_SIZE=$(wc -c < "$DUMP_FILE" | tr -d ' ')
echo "    Dump saved to $DUMP_FILE (${DUMP_SIZE} bytes)"

# ── Step 4: Restore into local DB ───────────────────────────
echo "==> Restoring into local database..."
PGPASSWORD="$LOCAL_DB_PASS" psql \
  -h "$LOCAL_DB_HOST" \
  -p "$LOCAL_DB_PORT" \
  -U "$LOCAL_DB_USER" \
  -d "$LOCAL_DB_NAME" \
  -f "$DUMP_FILE" \
  --quiet \
  2>&1 | grep -v "does not exist, skipping" | grep -v "^$" || true

echo "    Restore complete."

# ── Step 5: Verify ──────────────────────────────────────────
echo ""
echo "==> Verifying local data..."
PGPASSWORD="$LOCAL_DB_PASS" psql \
  -h "$LOCAL_DB_HOST" \
  -p "$LOCAL_DB_PORT" \
  -U "$LOCAL_DB_USER" \
  -d "$LOCAL_DB_NAME" \
  -c "SELECT 'tournaments' as table_name, count(*) FROM tournaments
      UNION ALL SELECT 'players', count(*) FROM players
      UNION ALL SELECT 'teams', count(*) FROM teams
      UNION ALL SELECT 'tournament_registrations', count(*) FROM tournament_registrations;"

echo ""
echo "Done! To switch to local env:"
echo "  ./scripts/switch-env.sh local"
echo "  npm run dev"
echo ""
echo "Local Supabase Studio: http://127.0.0.1:54323"
