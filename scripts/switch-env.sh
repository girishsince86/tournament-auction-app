#!/usr/bin/env bash
set -euo pipefail

# Switch .env.local between local and remote Supabase.
# Usage:
#   ./scripts/switch-env.sh local    # point app at local Docker Supabase
#   ./scripts/switch-env.sh remote   # point app at remote pbelvb2026 Supabase

TARGET="${1:-}"

if [ "$TARGET" != "local" ] && [ "$TARGET" != "remote" ]; then
  echo "Usage: ./scripts/switch-env.sh [local|remote]"
  echo ""
  echo "  local   - Point app at local Supabase (Docker)"
  echo "  remote  - Point app at remote Supabase (pbelvb2026)"
  echo ""
  if [ -f .env.local ]; then
    CURRENT_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d= -f2)
    if echo "$CURRENT_URL" | grep -q "127.0.0.1"; then
      echo "Currently: LOCAL ($CURRENT_URL)"
    else
      echo "Currently: REMOTE ($CURRENT_URL)"
    fi
  fi
  exit 1
fi

SOURCE=".env.local.${TARGET}"

if [ ! -f "$SOURCE" ]; then
  echo "Error: $SOURCE not found."
  echo "Run scripts/local-db-setup.sh first to create env variants."
  exit 1
fi

cp "$SOURCE" .env.local
echo "Switched to $TARGET environment."

URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d= -f2)
echo "SUPABASE_URL = $URL"
echo ""
echo "Restart your dev server: npm run dev"
