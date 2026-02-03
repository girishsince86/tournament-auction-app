# pbelvb2026 Supabase setup

This project is connected to the **pbelvb2026** Supabase project.

## Run migrations with Supabase CLI (recommended)

1. **Install and log in** (one-time):
   ```bash
   npx supabase login
   ```

2. **Push migrations** from the project root:
   ```bash
   ./scripts/supabase-db-push.sh
   ```
   When prompted, enter your **database password** (Supabase Dashboard → Project Settings → Database → Database password).

   To avoid the prompt, pass the password via env:
   ```bash
   SUPABASE_DB_PASSWORD=yourdbpassword ./scripts/supabase-db-push.sh
   ```

   Or run the CLI steps yourself:
   ```bash
   npx supabase link --project-ref anmwnigeusoztcbqywaj
   npx supabase db push
   ```

3. Migrations run in **filename order** under `supabase/migrations/` (the `archive/` folder is ignored). The script links to project ref `anmwnigeusoztcbqywaj` then runs `supabase db push`.

---

## 1. Environment

`.env.local` is already set with:

- `NEXT_PUBLIC_SUPABASE_URL` = https://anmwnigeusoztcbqywaj.supabase.co  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your publishable key  

Add the **service_role** key for admin/server actions:

1. Supabase Dashboard → **Project Settings** → **API**
2. Copy **service_role** (secret) and add to `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

If the app reports auth or API errors, try using the **anon public** key from the same API page (often a long JWT starting with `eyJ...`) for `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead of the publishable key.

## 2. Manual schema setup (if not using CLI)

If you prefer not to use the Supabase CLI, in the Supabase Dashboard for **pbelvb2026** open **SQL Editor** and run the migration files under `migrations/` **in filename order** (oldest first). The migration `20240320000003_add_tournament_id_to_players.sql` adds `tournament_id` to `players` before `load_players_from_registrations` runs.

## 3. Verify

- Run the app: `npm run dev`
- Open http://localhost:3000
- Check DB: http://localhost:3000/api/diagnostics/supabase (connection + schema check)

## 4. (Optional) RLS / admin emails

The baseline includes RLS that allows specific emails (e.g. `amit@pbel.in`, `vasu@pbel.in`) to verify registrations. To add or change admin/verifier emails, edit the policies in the Supabase Dashboard (Authentication → Policies) or add a small migration that drops and recreates those policies with your emails.
