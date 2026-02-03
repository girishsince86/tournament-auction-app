# Sports Presentation Styling Guide

This doc describes the **sports / broadcast-style** theme used for the public tournament pages (volleyball & throwball). The look is inspired by sports media and tournament coverage: dark surfaces, high-contrast accents, bold display typography, and subtle motion.

## Design pillars

- **Broadcast feel**: Dark backgrounds (#0a0e17, #111827, #1a2234), blue–orange accent gradient, clear hierarchy.
- **Scoreboard-style numbers**: Large, bold stats and headlines using the sports display font (Oswald).
- **Light motion**: Staggered reveals, hover lift on cards, optional glow and pulse for “live” elements.

## Tokens

### Colors (Tailwind & CSS vars)

| Token | Usage |
|-------|--------|
| `sports-surface-dark` | Page / hero background |
| `sports-surface-card` | Cards, panels |
| `sports-surface-elevated` | Raised surfaces |
| `sports-accent-blue` | Primary CTAs, links |
| `sports-highlight-orange` | Secondary accent, gradient end |
| `sports-live-red` | Live badge, alerts |
| `sports-neutral-muted` | Secondary text on dark |

In Tailwind: `bg-sports-surface-dark`, `text-sports-accent-blue`, etc.

### Typography

- **Display / headlines**: `font-sports-display` (Oswald) — use for hero titles, section titles, big numbers.
- **Labels**: Uppercase, increased letter-spacing (e.g. `tracking-widest`, `uppercase`).
- **Body**: Keep existing body font (DM Sans / Poppins) for readability.

### Animations (Tailwind)

- `animate-sports-fade-up` — fade in + move up (cards, sections).
- `animate-sports-slide-right` — slide in from right.
- `animate-sports-scale-in` — scale up into view.
- `animate-sports-glow-pulse` — subtle blue glow pulse.
- `animate-sports-live-pulse` — for “LIVE” badges.
- Stagger delays: `animate-sports-stagger-1` … `animate-sports-stagger-5` (0.05s–0.25s).

### CSS utility classes (globals.css)

- `.sports-hero-bg` — dark gradient hero background.
- `.sports-card` — dark card with border and hover lift/glow.
- `.sports-section-title` — uppercase label style.
- `.sports-section-title-bar` — short gradient bar under section titles.
- `.sports-live-badge` — red “LIVE” badge with pulse.
- `.sports-stat` — large number style.
- `.sports-accent-bar` — blue–orange gradient bar (e.g. under header).

## MUI theme

The app MUI theme uses the sports palette for **primary** (blue) and **secondary** (orange). Public layout and public pages use these plus local overrides (dark backgrounds, light text) for the broadcast look.

## Where it’s applied

- **Public layout**: Header (dark bar + gradient accent bar), main (dark gradient + glow), footer (dark + gradient top bar).
- **Public home**: Hero title (sports display font), stats (scoreboard-style cards), “Explore” section (sports cards), current tournament block (dark card).
- **Other public pages**: Can reuse `.sports-card`, section title + bar, and Tailwind sports tokens for consistency.

## Adding a “LIVE” badge

```tsx
<span className="sports-live-badge">LIVE</span>
```

## Adding a new sports-style section

1. Section label: `sports-section-title` + optional `sports-section-title-bar`.
2. Content: container with `sports-card` or `bg-sports-surface-card` and light text.
3. Optional: wrap content in motion with `animate-sports-fade-up` and stagger delays for list items.

## Assets

- Use existing volleyball/throwball imagery; overlays and cards already use the dark theme so imagery stays visible.
- Optional: add a very subtle noise or grain overlay for a broadcast texture (e.g. low-opacity layer).
