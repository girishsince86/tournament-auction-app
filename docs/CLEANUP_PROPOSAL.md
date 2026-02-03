# Repository Cleanup Proposal

This document proposes a structured cleanup of the tournament-auction-app repo to reduce clutter, remove dead code, and clarify what belongs where.

---

## 1. Root directory: SQL and one-off scripts

**Issue:** The repo root has **40+ SQL files** (migrations, fixes, analyses, one-off updates). These make the root noisy and blur the line between “canonical” migrations and ad-hoc scripts.

**Recommendation:**

| Action | Location | Notes |
|--------|----------|--------|
| **Keep in place** | `supabase/migrations/` | Only files that are part of the applied migration history. |
| **Move to `scripts/sql/` or `docs/sql/`** | All root-level `.sql` files | Create `scripts/sql/` (or `docs/sql/`) and move every root `.sql` there. Add a short `scripts/sql/README.md` (or section in main README) describing: “One-off and historical SQL scripts; not part of `supabase migrate`. Run only when needed and with care.” |
| **Optional: archive subfolder** | `scripts/sql/archive/` | For scripts that are clearly obsolete (e.g. superseded by a migration). |

**Root SQL files to move (examples):**

- `add_team_owner_profile_fields.sql`, `add_tournament_id_to_players.sql`
- `analyze_*.sql`, `fix_*.sql`, `update_*.sql`, `reset_*.sql`, `run_volleyball_migration.sql`
- `comprehensive_profile_image_fix.sql`, `copy_volleyball_registrations_to_players.sql`, etc.
- `storage_setup.sql`, `schema_management.sql`, `temp_fix_functions.sql`, `volleyball_players_migration.sql`
- All other `.sql` files at repo root

After the move, the root should contain no loose SQL files.

---

## 2. Root directory: test and temporary files

**Issue:** Test and one-off files at root look like they were used for manual or local testing and don’t belong in the main tree long term.

**Recommendation:**

| File | Action |
|------|--------|
| `test-registration.json` | Move to `scripts/` or `tests/fixtures/` if still needed; otherwise delete. |
| `test-registration.sh` | Move to `scripts/` if useful; otherwise delete. |
| `test-upload.js` | Move to `scripts/` or remove if obsolete. |
| `test_registration_statistics.sql` | Move with other SQL to `scripts/sql/` (or `docs/sql/`). |
| `test.txt`, `test.jpg` | Delete if not referenced anywhere (or move to a single `scripts/fixtures/` or `docs/` if needed). |

Add `test*.json`, `test*.sh`, `test*.sql` to `.gitignore` for the root if you want to avoid committing future ad-hoc test files, or keep them only under `scripts/` or `tests/`.

---

## 3. Root directory: CSV and misc

| File | Action |
|------|--------|
| `Supabase Snippet Get Table Information.csv` | Move to `docs/` or `scripts/` (e.g. `docs/db/` or `scripts/`), or delete if obsolete. |
| `players.json` | If it’s seed/sample data, move to `src/data/` or `scripts/fixtures/` and document in README. If one-off, move to `scripts/` or delete. |

---

## 4. Duplicate Tailwind config

**Issue:** Both `tailwind.config.js` and `tailwind.config.ts` exist with different content (e.g. different `content` paths and theme). PostCSS doesn’t specify a path, so Tailwind will resolve one (often `.js` first). Two configs risk confusion and inconsistent builds.

**Recommendation:**

- **Pick one:** Prefer `tailwind.config.ts` if the rest of the app is TypeScript, and ensure it includes all content paths from the current `.js` (e.g. `./src/app/**`, `./src/components/**`, `./src/features/**`, `./src/pages/**`).
- **Remove the other:** Delete `tailwind.config.js` (or the `.ts` if you standardize on `.js`) and run `npm run build` and a quick UI check to confirm nothing breaks.

---

## 5. Dead or duplicate code in `src/lib`

**Issue:** Unused or redundant modules increase maintenance and confusion.

**Recommendation:**

| File | Finding | Action |
|------|---------|--------|
| `src/lib/constants.tsx` | Not imported anywhere; `@/lib/constants` resolves to `constants.ts`. | **Remove** `constants.tsx`. |
| `src/lib/utils/format-updated.ts` | No imports found; `format.ts` is used everywhere. | **Remove** `format-updated.ts` (or merge any unique logic into `format.ts` first if needed). |

Keep a single source of truth for constants (e.g. `lib/constants.ts`); team-management can keep re-exporting from its `constants/index` if desired.

---

## 6. Development-only and test routes

**Issue:** Home page links to “Development Routes” (`/test-form`, `/theme-test`). These are useful in dev but shouldn’t be prominent in production.

**Recommendation:**

- **Option A (minimal):** Keep the routes but remove the “Development Routes” section from the home page (or hide it behind `process.env.NODE_ENV === 'development'`).
- **Option B (cleaner):** Move test/theme pages under a single dev-only prefix (e.g. `/_dev/test-form`, `/_dev/theme-test`) and document in README. Optionally guard with `NODE_ENV` or a simple feature flag so they’re not reachable in production.
- **Option C:** Delete `/test-form` and `/theme-test` if no longer needed; remove links from the home page.

Same idea for `/debug` (and any `/api/debug/*`): ensure they’re not required in production and are either behind a dev check or clearly documented as dev-only.

---

## 7. README and documentation consolidation

**Issue:** Multiple README-style docs at root (`README_cleanup_and_reload.md`, `README_profile_image_fix.md`, etc.) plus `AUTH_SESSION_FIX.md` and Supabase-specific README. Good content but scattered.

**Recommendation:**

- **Keep:** `README.md` as the main entry point (already references “Other documentation”).
- **Optional:** Add a short `docs/` tree and move topic-specific docs there, e.g.:
  - `docs/migrations-and-sql.md` – link to `scripts/sql/` and migration workflow
  - `docs/profile-images.md` – merge or link README_profile_image_*.md and README_supabase_storage_image_fix.md
  - `docs/volleyball-migration.md` – README_volleyball_migration.md, README_cleanup_and_reload.md
  - `docs/auth-session-fix.md` – AUTH_SESSION_FIX.md
- **Supabase:** Keep `supabase/README_PBVB2026_SETUP.md` where it is (or move to `docs/supabase-setup.md` and link from main README).
- After moving, **delete** the duplicate README_*.md and AUTH_SESSION_FIX.md from root (or replace with one-line pointers: “See docs/…”).

---

## 8. Scripts and SQL under `src`

**Issue:** `src/scripts/update-volleyball-players.sql` mixes SQL into the app source tree.

**Recommendation:**

- Move `src/scripts/update-volleyball-players.sql` to `scripts/sql/` (or `docs/sql/`) with the other SQL.
- Remove the empty (or nearly empty) `src/scripts/` directory if nothing else remains.
- Keep only app code and app-related config under `src/`.

---

## 9. `.gitignore` and env

**Recommendation:**

- **.gitignore:** Consider adding entries for local/test artifacts if you adopt a `scripts/sql/` or `tests/fixtures/` layout, e.g. `scripts/sql/local/` or `*.local.sql` if you use them. Optional.
- **.env.example:** Keep at root; ensure README and any “Other documentation” section reference it for required env vars.

---

## 10. Summary checklist

- [ ] Create `scripts/sql/` (or `docs/sql/`) and move all root-level `.sql` files there; add a short README or README section.
- [ ] Move or delete root test/temp files: `test-registration.json`, `test-registration.sh`, `test-upload.js`, `test.txt`, `test.jpg`; move `test_registration_statistics.sql` with other SQL.
- [ ] Move or delete `Supabase Snippet Get Table Information.csv` and clarify location of `players.json`.
- [ ] Resolve Tailwind config: keep one of `tailwind.config.js` / `tailwind.config.ts`, remove the other, verify build and UI.
- [ ] Remove dead code: `src/lib/constants.tsx`, `src/lib/utils/format-updated.ts` (after merging any needed logic).
- [ ] Reduce dev routes visibility: remove or gate “Development Routes” on home page; optionally move test/theme pages under `/_dev/` or remove.
- [ ] Consolidate docs: optional `docs/` layout and move README_*.md and AUTH_SESSION_FIX.md; update main README links.
- [ ] Move `src/scripts/update-volleyball-players.sql` to `scripts/sql/` and drop empty `src/scripts/` if applicable.

---

## Suggested order of execution

1. **Low risk:** Create `scripts/sql/`, move root SQL, add README; move `src/scripts/*.sql`; remove dead `constants.tsx` and `format-updated.ts`.
2. **Config:** Unify Tailwind config and verify build.
3. **Docs:** Consolidate READMEs into `docs/` and update links.
4. **Test files:** Move or delete root test/temp files and CSV.
5. **UX:** Adjust or remove dev routes on the home page and optionally relocate test pages.

If you want, the next step can be a concrete patch plan (e.g. “Phase 1: only SQL move + dead code removal”) with exact file moves and PR-sized steps.
