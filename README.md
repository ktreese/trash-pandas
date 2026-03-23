# Trash Pandas 14U — Team Website

Dark-mode photo & video gallery for the Trash Pandas 14U baseball club. Built with Next.js and Vercel Blob — no database required.

## How it works

Every upload creates two blobs:
- `uploads/{filename}` — the photo or video
- `meta/{uuid}.json` — tiny metadata file (caption, uploader, timestamp)

The gallery lists all `meta/` blobs and fetches them in parallel. That's it — no DB to provision.

## Local Development

### 1. Prerequisites

- Node.js 18+
- A [Vercel](https://vercel.com) account with a Blob store (free tier works)

### 2. Clone and install

```bash
git clone git@github.com:ktreese/trash-pandas.git
cd trash-pandas
npm install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

**Option A — Vercel CLI (recommended):**
```bash
npm i -g vercel
vercel link                  # link to your Vercel project
vercel env pull .env.local   # pulls BLOB_READ_WRITE_TOKEN automatically
```

**Option B — Manual:**
vercel.com → Storage → Blob → your store → `.env.local` tab → copy `BLOB_READ_WRITE_TOKEN` into `.env.local`

### 4. Start dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## Deploy to Vercel

```bash
git push origin main
```

Vercel auto-deploys on push. Make sure `BLOB_READ_WRITE_TOKEN` is set in your Vercel project → Settings → Environment Variables (the Blob store connection does this automatically if you linked it in the dashboard).

---

## Phase 2 (Planned)

- Game schedule page
- Player roster

## Color Palette

| Token | Hex | Use |
|-------|-----|-----|
| Black | `#0d0d0d` | Page background |
| Surface | `#1a1a1a` | Cards, panels |
| Purple | `#6B35A3` | Primary brand |
| Purple Bright | `#8B45C8` | Hover states |
| Purple Light | `#c4a0e8` | Text accents |
| Silver | `#8a8a8a` | Secondary text |
