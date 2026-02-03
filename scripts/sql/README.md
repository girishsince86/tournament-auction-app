# One-off and historical SQL scripts

These scripts are **not** part of the Supabase migration history. Canonical migrations live in `supabase/migrations/`.

- Run scripts only when needed and with care (prefer a test DB first).
- Use for: one-off fixes, analyses, data backfills, or reference. Do not rely on them for schema; use `supabase/migrations/` for that.
