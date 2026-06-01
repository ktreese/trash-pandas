@AGENTS.md

# Trash Pandas 14U — Project Context

## What this is
Dark-mode-only photo/video sharing + statistics website for the **Trash Pandas Howard 14U** baseball team. Parents upload game-day media from their phones. Coaches upload GameChanger CSV exports to populate stats. There is no public signup — access is gated by a team code.

**GitHub:** `git@github.com:ktreese/trash-pandas.git`  
**Deployed on:** Vercel (auto-deploys from `main`)

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js **16.2.1** with Turbopack (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (dark-mode only — never light mode) |
| Animation | Framer Motion 12 |
| Charts | Recharts 3 |
| Media storage | **Vercel Blob** — photos, videos, and the stats manifest JSON |
| Icons | lucide-react (use `ChevronsUpDown`, NOT `ChevronUpDown`) |

There is **no database** — all persistent state lives in Vercel Blob as JSON files.

---

## Design system

| Token | Hex | Use |
|---|---|---|
| `#0d0d0d` | Page background |
| `#131313` / `#161616` | Card surfaces |
| `#1a1a1a` | Tooltip / popover backgrounds |
| `#2a2a2a` | Borders, dividers |
| `#6B35A3` | Brand purple — CTAs, active states, icons |
| `#8B45C8` | Brand bright purple — hover states |
| `#c4a0e8` | Brand light purple — text accents, chart leaders |
| `#8a8a8a` | Brand silver — secondary text |
| `#8ae88a` | Green — wins, positive stats |
| `#e88a8a` | Red — losses, negative stats |

Logo files live in `public/logos/`: `tp-icon.png` (raccoon icon), `tp-dark.png` (horizontal logo), `tp-purple.png`, `batter.png`.

---

## Directory map

```
app/
  page.tsx                  — Home / media gallery (public)
  layout.tsx                — Root layout with Header
  upload/page.tsx           — Mobile upload form (team-code gated)
  stats/page.tsx            — Season + game stats (public, client component)
  admin/
    login/page.tsx          — Admin login
    dashboard/page.tsx      — Admin dashboard (server component)
  api/
    stats/route.ts          — GET → returns batting/pitching/fielding/gameLog/gameBoxScores
    auth/route.ts           — Login/logout
    media/route.ts          — Media CRUD
    upload/route.ts         — Blob upload handler
    download/route.ts       — Proxy downloads (forces Content-Disposition: attachment)
    admin/*/route.ts        — Admin-only API routes

components/
  stats/Charts.tsx          — All recharts chart components
  admin/
    AdminStatsManager.tsx   — CSV upload UI + game management
    LineupAdvisor.tsx       — Experimental batting order tool (admin only)
    AdminMediaGrid.tsx      — Deletable media grid
    StorageBar.tsx          — Blob storage usage bar
    LogoutButton.tsx

lib/
  stats.ts                  — TypeScript interfaces: BattingStats, PitchingStats, FieldingStats, GameResult, GameBoxScore
  stats-store.ts            — CSV parser + Vercel Blob manifest read/write
  media.ts                  — Blob media helpers
  auth.ts                   — Session auth
  rate-limit.ts
```

---

## Stats system architecture

1. **Admin uploads** a GameChanger all-season CSV via `AdminStatsManager`
2. `lib/stats-store.ts` → `parseSeasonCsv()` parses it into `{ batting, pitching, fielding }`
3. Individual game CSVs are also uploaded; `uploadGameCsv()` parses box scores and appends to the manifest
4. Everything is serialized into a single **`manifest.json`** stored in Vercel Blob
5. `GET /api/stats` reads the manifest and returns it as JSON

### Critical CDN cache gotcha
`blobs[0].url` is a CDN URL — appending `?t=${Date.now()}` is **required** to bypass stale edge cache after writes. `downloadUrl` alone does NOT bust the CDN. This is implemented in `getStatsManifest()`.

### Duplicate game guard
`uploadGameCsv()` checks `date + opponent.toLowerCase()` before inserting a game to prevent duplicates.

### GameChanger CSV column names (confirmed from real exports)
- Pitching: `#P` (not `NP`) for number of pitches; `BF` for batters faced
- Batting: `K-L` (strikeouts looking), `QAB` (quality at-bats), `QAB%`, `PS` (pitches seen), `PS/PA`
- Fielding: columns appear **after** `FPCT` in the CSV header row — use `headers.indexOf(pos, fpctIdx)` to find them unambiguously

---

## Key interfaces (`lib/stats.ts`)

```ts
BattingStats   { number, name, gp, pa, ab, avg, obp, ops, h, doubles, triples, hr,
                 rbi, r, bb, so, sb, hbp, kl?, qab?, qabPct, ps?, psPa? }

PitchingStats  { number, name, gp, ip, w, l, h, r, er, bb, so, bf?, np?, era, whip }

FieldingStats  { number, name, p?, c?, firstBase?, secondBase?, thirdBase?,
                 ss?, lf?, cf?, rf? }

GameResult     { id, date, dateShort, opponent, result, runsFor, runsAgainst,
                 teamHits, teamErrors }

GameBoxScore   { batting: GameBatting[], pitching: GamePitching[] }
```

---

## What's been built (as of May 2026)

### Public stats page (`app/stats/page.tsx`)
- Season summary badges (record, AVG, runs, RBI, SB)
- Season leader spotlight cards
- Analytics section with 6 charts (see Charts.tsx)
- Game log with clickable game cards → game box score detail
- "Without errors" earned-run what-if on each game card
- Season stats tables: **Batting** (23 cols incl. K-L/QAB/PS/PA), **Pitching** (15 cols incl. BF/#P), **Fielding** (position innings)
- Footnotes explaining QAB and PS/PA

### Charts (`components/stats/Charts.tsx`)
All chart components accept typed props — **no implicit `any`**:
- `BattingAvgChart` — horizontal bar, AVG + OBP
- `PlateDisciplineChart` — scatter (BB% vs K%, 4 quadrant colors). **Clicking a dot opens a per-player evolution modal** (line chart of BB%/K% per game, ESC/X/backdrop to close). Requires `gameLog` and `gameBoxScores` props.
- `ExtraBasePowerChart` — stacked bar (2B/3B/HR)
- `PitcherDualChart` — ERA + WHIP dual bar
- `KBBRatioChart` — K/BB ratio bar
- `RunsTrendChart` — cumulative runs for/against line chart. Same-date games get `(2)` suffix on the X-axis label to keep dataKey unique for recharts hover.

### Admin dashboard (`app/admin/dashboard/page.tsx`)
- Media gallery management (delete photos/videos)
- Storage bar
- `AdminStatsManager` — season CSV upload, game CSV upload, game deletion, manifest reset
- `LineupAdvisor` — experimental batting order tool (OBP-weighted composite score, sortable metric explorer, spot guide). Marked "Experimental" with yellow badge.

---

## Conventions & gotchas

- **All pages are dark-mode only** — never add `light:` Tailwind variants
- `app/stats/page.tsx` is a **client component** (`"use client"`) — data fetches via `useEffect` + `/api/stats`
- `app/admin/dashboard/page.tsx` is a **server component** — data fetches happen at render time
- Recharts `XAxis` `dataKey` must be unique per point — see `RunsTrendChart` same-date deduplication
- lucide-react: `ChevronsUpDown` (with 's') — `ChevronUpDown` does not exist and will cause a build error
- When deleting a game from admin, use the delete button in `AdminStatsManager` — it rewrites the manifest. Manually deleting the blob in Vercel does NOT remove the manifest entry.
- PA in per-game box scores is estimated as `AB + BB + HBP` (sac flies not available in GameChanger CSV)
