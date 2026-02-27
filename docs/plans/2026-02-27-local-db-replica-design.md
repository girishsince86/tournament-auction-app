# Local Database Replica Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up a local Supabase environment with full production data so we can develop/test locally and push schema changes to the live `pbelvb2026` project.

**Architecture:** `supabase start` runs a full Docker-based Supabase stack locally (Postgres 15, Auth, Realtime, Studio). We dump remote production data via `pg_dump` and restore it into the local Postgres. Env var switching controls which DB the app talks to.

**Tech Stack:** Supabase CLI v2.75, Docker, PostgreSQL 15, bash scripts, Next.js env vars

---

### Task 1: Start Local Supabase Stack

**Files:**
- Existing: `supabase/config.toml` (already configured)

**Step 1: Link project to remote (if not already linked)**

```bash
cd /Users/Girish/tournament-auction-app
supabase link --project-ref anmwnigeusoztcbqywaj
```

When prompted for DB password, enter: the project DB password.

Expected: "Finished supabase link."

**Step 2: Start the local Supabase stack**

```bash
supabase start
```

Expected: Docker pulls images (first time ~3-5 min), then outputs a status table with local URLs and keys. Note down the `API URL`, `anon key`, and `service_role key` from the output.

**Step 3: Verify local stack is running**

```bash
supabase status
```

Expected: Shows `API URL: http://127.0.0.1:54321`, `DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres`, and local keys.

**Step 4: Verify Studio is accessible**

Open `http://127.0.0.1:54323` in browser. Expected: Supabase Studio UI.

---

### Task 2: Create Env File Variants

**Files:**
- Backup: `.env.local` → `.env.local.remote`
- Create: `.env.local.local`
- Modify: `.gitignore`

**Step 1: Backup current remote env**

```bash
cp .env.local .env.local.remote
```

**Step 2: Create local env file**

Create `.env.local.local` with the keys from `supabase status` output:

```env
# Local Supabase (Docker)
NEXT_PUBLIC_REGISTRATION_OPEN=false
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from supabase status>
```

**Step 3: Update .gitignore**

Add these patterns to `.gitignore`:

```
# local supabase env variants
.env.local.remote
.env.local.local

# database dumps
*.dump
data_dump.sql
```

---

### Task 3: Dump Remote Data and Restore Locally

**Files:**
- Create: `scripts/local-db-setup.sh`

**Step 1: Create the setup script**

```bash
#!/usr/bin/env bash
set -euo pipefail

# ── Config ──────────────────────────────────────────────────
PROJECT_REF="anmwnigeusoztcbqywaj"
REMOTE_DB_HOST="db.${PROJECT_REF}.supabase.co"
REMOTE_DB_PORT=5432
REMOTE_DB_NAME="postgres"
REMOTE_DB_USER="postgres"

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
fi

# ── Step 1: Verify local Supabase is running ────────────────
echo "Checking local Supabase..."
if ! supabase status &>/dev/null; then
  echo "Local Supabase not running. Starting..."
  supabase start
fi
echo "Local Supabase is running."

# ── Step 2: Dump remote data ────────────────────────────────
echo "Dumping remote database (schema + data)..."
PGPASSWORD="$SUPABASE_DB_PASSWORD" pg_dump \
  -h "$REMOTE_DB_HOST" \
  -p "$REMOTE_DB_PORT" \
  -U "$REMOTE_DB_USER" \
  -d "$REMOTE_DB_NAME" \
  --no-owner \
  --no-privileges \
  --no-comments \
  --schema=public \
  --clean \
  --if-exists \
  > "$DUMP_FILE"

echo "Dump saved to $DUMP_FILE ($(wc -c < "$DUMP_FILE") bytes)"

# ── Step 3: Restore into local DB ───────────────────────────
echo "Restoring into local database..."
PGPASSWORD="$LOCAL_DB_PASS" psql \
  -h "$LOCAL_DB_HOST" \
  -p "$LOCAL_DB_PORT" \
  -U "$LOCAL_DB_USER" \
  -d "$LOCAL_DB_NAME" \
  -f "$DUMP_FILE" \
  --quiet \
  2>&1 | grep -v "^ERROR.*does not exist, skipping$" || true

echo "Restore complete."

# ── Step 4: Verify ──────────────────────────────────────────
echo ""
echo "Verifying local data..."
PGPASSWORD="$LOCAL_DB_PASS" psql \
  -h "$LOCAL_DB_HOST" \
  -p "$LOCAL_DB_PORT" \
  -U "$LOCAL_DB_USER" \
  -d "$LOCAL_DB_NAME" \
  -c "SELECT 'tournaments' as tbl, count(*) FROM tournaments
      UNION ALL SELECT 'players', count(*) FROM players
      UNION ALL SELECT 'teams', count(*) FROM teams
      UNION ALL SELECT 'registrations', count(*) FROM tournament_registrations;"

echo ""
echo "Done! Switch to local env with: ./scripts/switch-env.sh local"
```

**Step 2: Make executable**

```bash
chmod +x scripts/local-db-setup.sh
```

**Step 3: Run it**

```bash
SUPABASE_DB_PASSWORD=OSiVNjFC1gY1JRKb ./scripts/local-db-setup.sh
```

Expected: Dumps remote DB, restores locally, prints row counts for key tables.

---

### Task 4: Create Env Switching Script

**Files:**
- Create: `scripts/switch-env.sh`

**Step 1: Create the script**

```bash
#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-}"

if [ "$TARGET" != "local" ] && [ "$TARGET" != "remote" ]; then
  echo "Usage: ./scripts/switch-env.sh [local|remote]"
  echo ""
  echo "  local   - Point app at local Supabase (Docker)"
  echo "  remote  - Point app at remote Supabase (pbelvb2026)"
  echo ""
  # Show current setting
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

# Show what we switched to
URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d= -f2)
echo "SUPABASE_URL = $URL"
echo ""
echo "Restart your dev server: npm run dev"
```

**Step 2: Make executable**

```bash
chmod +x scripts/switch-env.sh
```

---

### Task 5: Create Data Refresh Script

**Files:**
- Create: `scripts/refresh-local-data.sh`

**Step 1: Create the script**

```bash
#!/usr/bin/env bash
set -euo pipefail

# ── Config ──────────────────────────────────────────────────
PROJECT_REF="anmwnigeusoztcbqywaj"
REMOTE_DB_HOST="db.${PROJECT_REF}.supabase.co"
REMOTE_DB_PORT=5432
REMOTE_DB_USER="postgres"

LOCAL_DB_HOST="127.0.0.1"
LOCAL_DB_PORT=54322
LOCAL_DB_USER="postgres"
LOCAL_DB_PASS="postgres"

DUMP_FILE="data_dump.sql"

# ── Prompt for remote DB password ───────────────────────────
if [ -z "${SUPABASE_DB_PASSWORD:-}" ]; then
  echo "Enter remote Supabase DB password:"
  read -s SUPABASE_DB_PASSWORD
fi

# ── Verify local Supabase is running ────────────────────────
if ! supabase status &>/dev/null; then
  echo "Error: Local Supabase is not running. Run 'supabase start' first."
  exit 1
fi

# ── Dump remote data only ───────────────────────────────────
echo "Dumping remote data..."
PGPASSWORD="$SUPABASE_DB_PASSWORD" pg_dump \
  -h "$REMOTE_DB_HOST" \
  -p "$REMOTE_DB_PORT" \
  -U "$REMOTE_DB_USER" \
  -d postgres \
  --data-only \
  --schema=public \
  > "$DUMP_FILE"

echo "Dump: $(wc -c < "$DUMP_FILE") bytes"

# ── Truncate local tables then restore ──────────────────────
echo "Clearing local data and restoring..."
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

PGPASSWORD="$LOCAL_DB_PASS" psql \
  -h "$LOCAL_DB_HOST" \
  -p "$LOCAL_DB_PORT" \
  -U "$LOCAL_DB_USER" \
  -d postgres \
  -f "$DUMP_FILE" \
  --quiet 2>&1 | grep -v "^ERROR" || true

echo "Data refresh complete."

# ── Verify ──────────────────────────────────────────────────
PGPASSWORD="$LOCAL_DB_PASS" psql \
  -h "$LOCAL_DB_HOST" \
  -p "$LOCAL_DB_PORT" \
  -U "$LOCAL_DB_USER" \
  -d postgres \
  -c "SELECT 'tournaments' as tbl, count(*) FROM tournaments
      UNION ALL SELECT 'players', count(*) FROM players
      UNION ALL SELECT 'teams', count(*) FROM teams;"
```

**Step 2: Make executable**

```bash
chmod +x scripts/refresh-local-data.sh
```

---

### Task 6: Test End-to-End

**Step 1: Switch to local env**

```bash
./scripts/switch-env.sh local
```

**Step 2: Start dev server**

```bash
npm run dev
```

**Step 3: Verify the app works**

- Open `http://localhost:3000`
- Check diagnostics: `http://localhost:3000/api/diagnostics/supabase`
- Browse local Studio: `http://127.0.0.1:54323`

**Step 4: Switch back to remote**

```bash
./scripts/switch-env.sh remote
```

---

### Task 7: Commit

**Step 1: Stage and commit**

```bash
git add scripts/local-db-setup.sh scripts/switch-env.sh scripts/refresh-local-data.sh .gitignore docs/plans/
git commit -m "feat: add local Supabase development workflow with data replica scripts"
```
