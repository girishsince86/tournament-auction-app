# Register admin users with curl

Admin emails (from `src/middleware.ts`) that get full admin access:

- `gk@pbel.in`
- `admin@pbel.in`
- `amit@pbel.in`
- `vasu@pbel.in`

**Requirements:** App running (e.g. `npm run dev`) and `SUPABASE_SERVICE_ROLE_KEY` set in `.env.local`.

## Option 1: Shell script (same password for all)

```bash
chmod +x scripts/register-admin-users.sh
./scripts/register-admin-users.sh                    # http://localhost:3000, password ChangeMe123!
./scripts/register-admin-users.sh http://localhost:3000 MySecurePass
```

## Option 2: Individual curl commands

Replace `YOUR_PASSWORD` and `BASE_URL` (e.g. `http://localhost:3000`) as needed.

```bash
BASE_URL="http://localhost:3000"

# gk@pbel.in
curl -X POST "$BASE_URL/api/admin/create-admin" \
  -H "Content-Type: application/json" \
  -d '{"email":"gk@pbel.in","password":"YOUR_PASSWORD"}'

# admin@pbel.in
curl -X POST "$BASE_URL/api/admin/create-admin" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pbel.in","password":"YOUR_PASSWORD"}'

# amit@pbel.in
curl -X POST "$BASE_URL/api/admin/create-admin" \
  -H "Content-Type: application/json" \
  -d '{"email":"amit@pbel.in","password":"YOUR_PASSWORD"}'

# vasu@pbel.in
curl -X POST "$BASE_URL/api/admin/create-admin" \
  -H "Content-Type: application/json" \
  -d '{"email":"vasu@pbel.in","password":"YOUR_PASSWORD"}'
```

Success response: `{"success":true,"user":{...}}`.  
If the user already exists you may get a 500 with a message like "User already registered"; that’s expected.
