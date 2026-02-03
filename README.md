# Tournament Auction App

A Next.js application for managing sports (e.g. volleyball) tournament registrations and live player auctions. Organizers create tournaments and categories; players register; team owners bid on players during real-time auctions with configurable budgets and categories.

## Features

- **Authentication** — Sign up, login, email verification. Roles: Admin, Conductor, Team Owner.
- **Tournament management** — Create tournaments with registration deadlines, team budgets, and player categories (skill levels, base points, min/max points).
- **Player registration** — Players register for tournaments with profile data, positions, jersey numbers, and optional profile images.
- **Live auction** — Queue-based auction with timer, bidding, undo, and real-time updates. Conductor controls queue order and processes bids; team owners place bids within budget.
- **Team management** — Teams per tournament with remaining budget, preferred players, and roster. Team owner profiles with avatars.
- **Admin** — Manage registrations (verify, edit), tournaments, player categories, team budgets, and load players from registrations.
- **Public views** — Browse organizers, team owners, players, and tournament groups without signing in.

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Backend / DB / Auth:** [Supabase](https://supabase.com) (PostgreSQL, Auth, optional Storage)
- **UI:** Tailwind CSS, MUI (Material UI), Headless UI, Radix, Framer Motion
- **Data:** TanStack React Query, React Hook Form (Formik, Yup, Zod)
- **Deployment:** Vercel-ready (`vercel.json` included)

## Prerequisites

- Node.js 18+
- npm (or yarn/pnpm)
- A [Supabase](https://supabase.com) project

## Setup

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd tournament-auction-app
   npm install
   ```

2. **Environment variables**

   Create a `.env.local` in the project root (see `.gitignore`; never commit secrets).

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous (public) key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Yes (for admin/server) | Supabase service role key; keep server-only |
   | `NEXT_PUBLIC_APP_URL` | No | App URL (e.g. `http://localhost:3000` for dev) |
   | `NEXT_PUBLIC_MUI_X_KEY` | No | MUI X Data Grid Pro license key (optional) |

3. **Database**

   Apply Supabase migrations so the schema matches the app (e.g. tournaments, teams, players, player_categories, auction_queue, bids, tournament_registrations, etc.):

   - Use the [Supabase CLI](https://supabase.com/docs/guides/cli) and run migrations from `supabase/migrations/`, or
   - Run the SQL in those migrations manually in the Supabase SQL editor.

   The app expects tables such as: `tournaments`, `teams`, `players`, `player_categories`, `tournament_registrations`, `auction_queue`, `bids`, `auction_rounds`, `preferred_players`, and related RLS/policies.

4. **Run locally**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). The home page lists public, protected, and admin routes.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production (`node build.js`) |
| `npm run start` | Start production server (`node server.js`) |
| `npm run lint` | Run Next.js ESLint |

## Project structure (high level)

- `src/app/` — Next.js App Router: `(auth)`, `(protected)`, `(public)`, `admin/`, `api/`, `team-management/`, `tournaments/`, etc.
- `src/components/` — Shared UI: auction (e.g. `QueueManager`, `Timer`), layout, team-owner, tournament-management, `ui/`.
- `src/contexts/` — Auth and other React contexts.
- `src/features/` — Feature-specific components.
- `src/hooks/` — `useAuctionQueue`, `useAuctionRealtime`, `useAuctionTimer`, `useTeams`, `useTournaments`, etc.
- `src/lib/` — Supabase client/server/admin, API helpers, DB types, utils.
- `src/types/` — Shared TypeScript types (auction, auth, team, tournament, etc.).
- `supabase/migrations/` — PostgreSQL migrations (baseline and feature migrations).
- `scripts/sql/` — One-off and historical SQL scripts (not part of `supabase migrate`); see `scripts/sql/README.md`.
- `scripts/fixtures/` — Sample/fixture data (e.g. `players.json`).
- `docs/` — Topic docs (migrations, profile images, auth, cleanup).

## Key routes (reference)

- **Public:** `/`, `/login`, `/register`; public API under `/api/public/` (tournaments, players, organizers, team-owners, etc.).
- **Protected:** `/dashboard`, `/tournaments`, `/registration-summary`, `/teams/[teamId]/*`, `/tournament/[tournamentId]/players`, `/auction/[tournamentId]/control`, `/profile`, `/team-owner/profile`.
- **Admin:** `/admin/registrations`, `/admin/auction`, `/admin/tournaments`, `/admin/teams`, `/admin/player-categories`, `/admin/team-budgets`, `/admin/tournament-management`, `/manage-players`.

API routes under `src/app/api/` cover auth, admin registrations/players, auction (queue, bid, undo, available players), teams, tournaments, and public data.

## Deployment (e.g. Vercel)

- Set the same environment variables in your hosting dashboard (Vercel: Project → Settings → Environment Variables).
- Build command: `npm run build` (or as in `vercel.json`).
- The repo includes a `vercel.json` (Next.js, no static generation, cache headers, region).

## Other documentation

- [docs/README_volleyball_migration.md](docs/README_volleyball_migration.md) — Migrating volleyball registrations into the `players` table.
- [docs/README_profile_image_fix.md](docs/README_profile_image_fix.md), [docs/README_profile_image_update.md](docs/README_profile_image_update.md), [docs/README_supabase_storage_image_fix.md](docs/README_supabase_storage_image_fix.md) — Profile image handling and fixes.
- [docs/README_cleanup_and_reload.md](docs/README_cleanup_and_reload.md) — DB/Storage cleanup and image fixes.
- [docs/AUTH_SESSION_FIX.md](docs/AUTH_SESSION_FIX.md) — Auth session and password-change fixes.
- [docs/CLEANUP_PROPOSAL.md](docs/CLEANUP_PROPOSAL.md) — Repository cleanup proposal (this cleanup).
- [supabase/README_PBVB2026_SETUP.md](supabase/README_PBVB2026_SETUP.md) — Supabase PBVB 2026 setup.

## License

Private. All rights reserved.
