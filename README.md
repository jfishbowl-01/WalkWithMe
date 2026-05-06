# WalkWithMe

Personal walking app for **Cambridge, Massachusetts**: a **street-completion game** and private atlas — not primarily a fitness tracker.

**Flow:** Start walk → record GPS (or demo route) → finish → save walk → match route to mock street geometry → light up the map → journal + progress.

This repo is a **local-first MVP** with **Supabase/PostGIS migrations** ready for the next phase (real auth, server persistence, OSM-backed segments).

---

## Tech stack

| Layer | Choice |
|--------|--------|
| Framework | Next.js **16** (App Router), React **19**, TypeScript |
| Styling | Tailwind CSS **4** |
| Map | **MapLibre GL** (`map-view.tsx`; dynamic `ssr: false` on `/map`) |
| Geo | **Turf.js** (completion heuristics) |
| Storage | **`localStorage`** via versioned `local-store` + **repositories** |
| Backend (scaffold) | **Supabase** client/server helpers; optional env vars |

Optional dependency **react-map-gl** is installed; the primary map implementation is imperative MapLibre in `map-view.tsx`.

---

## Routes

| Path | Purpose |
|------|---------|
| `/` | Redirects to `/login` |
| `/login` | Mock sign-in |
| `/map` | Full-bleed map, walk tracking, bottom tabs + profile bubble |
| `/journal` | Saved walks list |
| `/walk/[id]` | Walk summary + notes + local photo thumbnails (base64 in storage) |
| `/progress` | Stats, records, streaks, completion map (**client-only dashboard**; see below) |
| `/settings` | Map style, units, privacy, account; developer block only in `NODE_ENV !== 'production'` |

---

## UI / navigation (current)

- **Bottom tab bar** — shared component `AppBottomTabs` (`fixed` on shell pages, `absolute` on map). Nav config: `src/lib/config/nav.ts` (`MAIN_NAV_ITEMS`).
- **Profile** — initials bubble → `/settings` (`ProfileBubble`). Map page has the same bubble (safe-area aware).
- **App shell** — `AppShell`: title + subtitle + profile; main content; bottom padding for tabs.

---

## Data & architecture

### Persistence (today)

Single JSON blob in **`localStorage`** key `walkwithme.app-state` (`LOCAL_APP_STATE_VERSION`). Holds:

- session (mock user)
- walks
- completed segment records
- privacy settings
- placeholder achievements

**Read/write** goes through **`src/lib/storage/repositories.ts`** (`walkRepository`, `completionRepository`, `sessionRepository`, etc.). Prefer extending repositories rather than calling `localStorage` from random components.

### Completion vs “walks logged”

- **Walks** = every saved trip (journal).
- **Completed streets / segments** = geometry matched by `calculateCompletedSegments.ts` (threshold ~75% of segment length). You can have many walks but **low completion** if routes don’t overlap the mock network.

### Supabase (future)

SQL under `supabase/migrations/`. Helpers return `null` when `NEXT_PUBLIC_SUPABASE_*` are unset. Env validation: `src/lib/config/env.ts`.

---

## SSR, hydration, and Progress

On the server, `readLocalAppState()` has **no `window`** → **empty defaults**. Client components that initialize state from storage in `useState(() => …)` can **hydrate with zeros** and look “disconnected” from real data.

**Mitigation:** `src/app/progress/page.tsx` loads `ProgressDashboard` with **`next/dynamic(..., { ssr: false })`** so stats always read real storage in the browser. Apply the same pattern for any new screen that must show storage-backed numbers on first paint.

---

## Project layout

```text
src/app/           # App Router pages
src/components/
  shell/           # AppShell, AppBottomTabs, ProfileBubble
  map/             # map-view, map-controls-card
  walk/            # tracking, summary, thumbnails
  journal/
  progress/        # progress-dashboard (client-only entry), cards, heatmap
  ui/              # Button, Card
src/lib/
  auth/            # mock session helpers
  config/          # env, nav
  geo/             # completion, distance, formatters, segment-status
  hooks/           # useWalkTracker, useLocalSession, useUnitPreference
  map/             # style, layer source ids
  mock-data/       # cambridge-segments, demo-walks
  storage/         # local-store, repositories, progress-calculations
  supabase/
src/types/
supabase/migrations/
```

**Removed / unused:** old standalone `street-segment-layer` / `current-walk-layer` / `progress-card` were not imported anywhere and have been deleted to avoid drift.

---

## Environment variables

Copy **`.env.local.example`** → `.env.local`.

| Variable | Role |
|----------|------|
| `NEXT_PUBLIC_MAPTILER_KEY` | MapTiler styles (recommended) |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional until wired |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional until wired |

Without MapTiler, the app uses a dimmed **OSM raster** fallback (rate limits at high zoom).

---

## Map styles

User-selectable presets in **Settings** (`src/lib/map/map-style.ts`). Preference: `localStorage` key `mapStylePreset`. Map listens for `mapStyleChange` custom event.

---

## GPS & completion (MVP limits)

- **Foreground** geolocation only; laptop accuracy can be poor vs phone.
- Completion is **proximity/heuristic**, not production map-matching; parallel streets can false-positive.
- **Demo walk** is available when `NODE_ENV !== "production"`.

---

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

---

## Deploy on Netlify

1. Push this repo to GitHub (or connect the repo in the Netlify UI).
2. **New site from Git** → pick the repo → Netlify should detect **Next.js** and use `npm run build` (see [`netlify.toml`](netlify.toml); Node **20** is pinned for builds).
3. **Site settings → Environment variables** (production + preview): set at least **`NEXT_PUBLIC_MAPTILER_KEY`** from [MapTiler](https://cloud.maptiler.com/). Supabase vars stay optional until you wire auth/persistence.
4. Deploy. The map falls back to a dimmed OSM raster if MapTiler is unset (not ideal for production traffic).

CLI (optional): `npx netlify login`, then `npx netlify link --git-remote-url https://github.com/jfishbowl-01/WalkWithMe.git`, and `npx netlify deploy --prod` when you want a manual production deploy.

---

## Agent handoff (Claude Code / next maintainer)

### Solid foundations

- Clear separation: **geo** / **storage** / **UI** / **types**.
- **Repositories** as the persistence seam for a future API.
- **Units** and **map style** centralized.
- **Bottom nav** centralized in `nav.ts`.

### Likely big decisions next

1. **Supabase Auth** — replace mock session; middleware or layout guards; profile row trigger already in migrations.
2. **Sync model** — migrate walks + `completed_segments` off `localStorage`; conflict/version strategy if keeping offline.
3. **Segments** — replace `cambridge-segments.ts` with `street_segments` queries + bbox; keep completion API stable if possible.
4. **Completion location** — move Turf logic to **PostGIS** (or edge function) for consistent results; keep `walk_segment_matches` for debugging.
5. **Photos** — today: **base64 in local JSON** (bad for size). Move to **Supabase Storage** + URLs on `walk_photos`.
6. **Dead dependency audit** — confirm whether **react-map-gl** should stay or be removed if unused.

### Docs entry points

- **README.md** (this file) — product + architecture + env.
- **AGENTS.md** — Next 16 note + conventions + SSR caveat.
- **CLAUDE.md** — short pointer to README + AGENTS.

### Product backlog (short)

Wire auth → persist walks → PostGIS completion → real segment import → photo storage → privacy-safe export. Longer wishlist: Strava/Health import, native shell if background GPS is required.

---

## License / usage

Structured as a **personal prototype** for WalkWithMe; adjust license as needed before public distribution.
