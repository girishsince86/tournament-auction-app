#!/usr/bin/env bash
# Run Supabase migrations against the linked remote project (pbelvb2026).
# Usage:
#   ./scripts/supabase-db-push.sh
# Or with database password (avoids prompt):
#   SUPABASE_DB_PASSWORD=yourpassword ./scripts/supabase-db-push.sh
set -e
cd "$(dirname "$0")/.."

PROJECT_REF="${SUPABASE_PROJECT_REF:-anmwnigeusoztcbqywaj}"

echo "Ensure you have run: npx supabase login"
echo "Linking to Supabase project: $PROJECT_REF"
if [ -n "$SUPABASE_DB_PASSWORD" ]; then
  npx supabase link --project-ref "$PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"
else
  echo "Enter the database password when prompted (Project Settings → Database in Supabase dashboard)."
  npx supabase link --project-ref "$PROJECT_REF"
fi

echo "Pushing migrations..."
npx supabase db push

echo "Done. Migrations have been applied to the remote database."
