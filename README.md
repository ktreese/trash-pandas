# Trash Pandas 14U — Team Website

Dark-mode photo & video gallery for the Trash Pandas 14U baseball club. Built with Next.js, Vercel Blob, and Neon Postgres.

## Local Development

### 1. Prerequisites

- Node.js 18+
- A free [Neon](https://neon.tech) Postgres database
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
# Fill in DATABASE_URL and BLOB_READ_WRITE_TOKEN
```

**Option A — Vercel CLI (recommended):**
```bash
npm i -g vercel
vercel link             # link to your Vercel project
vercel env pull .env.local   # pulls Blob token automatically
```

**Option B — Manual:**
- Neon: create a project at [neon.tech](https://neon.tech), copy the pooled connection string → `DATABASE_URL`
- Vercel Blob: vercel.com → Storage → Blob → your store → `.env.local` tab → copy `BLOB_READ_WRITE_TOKEN`

### 4. Run the DB migration

Open the Neon SQL editor (or any Postgres client) and run:

```bash
# Paste contents of migrations/001_init.sql
```

### 5. Start dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## Deploy to Vercel

```bash
vercel deploy --prod
```

Ensure `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` are set in Vercel project → Settings → Environment Variables.

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
