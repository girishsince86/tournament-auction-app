#!/usr/bin/env bash
# Register all admin users via POST /api/admin/create-admin
# Requires: app running (e.g. npm run dev) and SUPABASE_SERVICE_ROLE_KEY in .env.local
#
# Usage:
#   ./scripts/register-admin-users.sh [BASE_URL] [PASSWORD]
#   BASE_URL defaults to http://localhost:3000
#   PASSWORD defaults to "ChangeMe123!" (admins should change after first login)

set -e
BASE_URL="${1:-http://localhost:3000}"
PASSWORD="${2:-ChangeMe123!}"

# Admin emails from src/middleware.ts (isFullAdmin)
ADMINS=(
  "gk@pbel.in"
  "admin@pbel.in"
  "amit@pbel.in"
  "vasu@pbel.in"
)

echo "Registering admin users at $BASE_URL (password: ****)"
echo ""

for email in "${ADMINS[@]}"; do
  echo -n "Creating $email ... "
  response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/admin/create-admin" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$PASSWORD\"}")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  if [ "$http_code" = "200" ]; then
    echo "OK"
  else
    echo "HTTP $http_code"
    echo "$body" | head -c 200
    echo ""
  fi
done

echo ""
echo "Done. Admins can sign in at $BASE_URL/login and should change their password in Profile."
