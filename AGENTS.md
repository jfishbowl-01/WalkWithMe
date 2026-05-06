<!-- BEGIN:nextjs-agent-rules -->
# Next.js version

This project uses **Next.js 16** (App Router). APIs and defaults may differ from older Next versions. When in doubt, check `node_modules/next` docs or this repo’s patterns before changing routing, caching, or server/client boundaries.

<!-- END:nextjs-agent-rules -->

# WalkWithMe — agent conventions

## What this app is

Local-first **Cambridge walking / street-completion** prototype: GPS (or demo) walk → save route in browser → Turf-based segment completion → map + journal + progress. Supabase schema exists; **runtime persistence is still `localStorage`**.

## Commands

```bash
npm install
npm run dev    # http://localhost:3000 → redirects to /login
npm run lint
npm run build
```

## Where logic lives

| Area | Location |
|------|----------|
| Routes | `src/app/**/page.tsx` |
| Shell + bottom nav + profile | `src/components/shell/` |
| Map (MapLibre imperative) | `src/components/map/map-view.tsx` |
| Walk tracking | `src/lib/hooks/useWalkTracker.ts`, `src/app/map/page.tsx` |
| Persistence | `src/lib/storage/local-store.ts`, `repositories.ts` |
| Completion math | `src/lib/geo/calculateCompletedSegments.ts` |
| Segment mock data | `src/lib/mock-data/cambridge-segments.ts` |
| Supabase factories | `src/lib/supabase/client.ts`, `server.ts` |
| SQL | `supabase/migrations/*.sql` |

## Conventions

- **Tester-facing copy** — prefer short, plain language in [`src/lib/config/user-facing-copy.ts`](src/lib/config/user-facing-copy.ts) for concepts like “sample map” and device-only storage; wire into UI from there when it fits.
- **Repositories** (`walkRepository`, `completionRepository`, etc.) are the abstraction over local state; future backend work should keep a similar surface area where possible.
- **Types** live under `src/types/`.
- **Nav items** — single source: `src/lib/config/nav.ts` (`MAIN_NAV_ITEMS`).
- **Units** — `useUnitPreference` + `formatMeters(..., units)`; Settings dispatches `unitsChange`.
- **Client-only map** — `MapView` is dynamically imported with `ssr: false` from the map page.

## Critical: `localStorage` and SSR

`readLocalAppState()` returns **empty defaults** when `window` is undefined. Any page that **hydrates** with `useState(() => readStorage())` can show **stale zeros** until a refocus or remount.

**Progress** avoids this by loading the dashboard with `next/dynamic(..., { ssr: false })` in `src/app/progress/page.tsx`.

**Journal** (`journal/page.tsx` → `journal-client.tsx`), **walk detail** (`walk/[id]/page.tsx` → `walk-detail-client.tsx`), and **Settings** (`settings/page.tsx` → `settings-client.tsx`) use `dynamic(..., { ssr: false })` or deferred reads so `localStorage` is not empty on the server.

When adding new screens that read storage on first paint, either:

- use **`dynamic` + `ssr: false`** for the subtree that reads storage, or  
- render a neutral shell on the server and **`useEffect`**-load data on the client (mind ESLint `set-state-in-effect` rules), or  
- use a pattern like **`useSyncExternalStore`** with a correct `getServerSnapshot`.

## Map stack

- Main map: **maplibre-gl** in `map-view.tsx`.
- **react-map-gl** is a dependency but most UI is **not** using declarative `Map` from react-map-gl; do not assume layers are in separate components unless you see imports.

## Auth

Mock session via `sessionRepository` / `useLocalSession`. Replace with Supabase Auth without renaming routes if possible (`/login`, etc.).

## Git / handoff

See **README.md → Agent handoff** for open architectural decisions and suggested next steps.
