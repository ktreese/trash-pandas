import { list, put, del } from "@vercel/blob";
import Papa from "papaparse";
import type {
  BattingStats,
  PitchingStats,
  GameResult,
  GameBoxScore,
  GameBatting,
  GamePitching,
} from "./stats";

// ─── Blob paths ───────────────────────────────────────────────────
const STATS_PREFIX = "stats/";
const MANIFEST_PATH = `${STATS_PREFIX}manifest.json`;

// ─── Manifest type ────────────────────────────────────────────────
export interface StatsManifest {
  season: {
    csvUrl: string;
    uploadedAt: string;
    batting: BattingStats[];
    pitching: PitchingStats[];
  } | null;
  games: GameEntry[];
}

export interface GameEntry {
  id: number;
  date: string;
  dateShort: string;
  opponent: string;
  runsFor: number;
  runsAgainst: number;
  result: "W" | "L" | "T";
  teamHits: number;
  teamErrors: number;
  csvUrl: string;
  uploadedAt: string;
  boxScore: GameBoxScore;
}

// ─── In-memory write-through cache ───────────────────────────────
// After a write, blob storage may take seconds to return the new version.
// We cache the last-written manifest so the next read within the same
// serverless instance gets the correct state (prevents read-modify-write races
// during rapid sequential uploads).
let cachedManifest: { data: StatsManifest; writtenAt: number } | null = null;
const CACHE_TTL_MS = 30_000; // trust cache for 30 seconds after a write

// ─── Read manifest ────────────────────────────────────────────────
export async function getStatsManifest(): Promise<StatsManifest> {
  // Return cached version if we wrote recently (avoids stale blob reads)
  if (cachedManifest && Date.now() - cachedManifest.writtenAt < CACHE_TTL_MS) {
    return structuredClone(cachedManifest.data);
  }

  try {
    const { blobs } = await list({ prefix: MANIFEST_PATH });
    if (blobs.length === 0) return { season: null, games: [] };
    // Append timestamp to bust Vercel CDN cache — cache: "no-store" only skips
    // Next.js's fetch cache, not the edge CDN layer in front of Blob storage.
    const res = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return { season: null, games: [] };
    return (await res.json()) as StatsManifest;
  } catch {
    return { season: null, games: [] };
  }
}

// ─── Write manifest ───────────────────────────────────────────────
async function saveManifest(manifest: StatsManifest): Promise<void> {
  await put(MANIFEST_PATH, JSON.stringify(manifest), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  // Cache the manifest we just wrote so immediate re-reads are consistent
  cachedManifest = { data: structuredClone(manifest), writtenAt: Date.now() };
}

// ─── Upload season CSV ────────────────────────────────────────────
export async function uploadSeasonCsv(csvText: string): Promise<StatsManifest> {
  const { batting, pitching } = parseSeasonCsv(csvText);

  // Store raw CSV in blob
  const csvBlob = await put(`${STATS_PREFIX}season.csv`, csvText, {
    access: "public",
    contentType: "text/csv",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  const manifest = await getStatsManifest();
  manifest.season = {
    csvUrl: csvBlob.url,
    uploadedAt: new Date().toISOString(),
    batting,
    pitching,
  };

  await saveManifest(manifest);
  return manifest;
}

// ─── Upload game CSV ──────────────────────────────────────────────
export async function uploadGameCsv(
  csvText: string,
  meta: {
    date: string;
    opponent: string;
  }
): Promise<StatsManifest> {
  const manifest = await getStatsManifest();

  // Format date first so we can check for duplicates before doing any work
  const dEarly = new Date(meta.date + "T00:00:00");
  const dateDisplayEarly = dEarly.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const duplicate = manifest.games.find(
    (g) => g.date === dateDisplayEarly && g.opponent.toLowerCase() === meta.opponent.toLowerCase()
  );
  if (duplicate) {
    throw new Error(`A game vs ${meta.opponent} on ${dateDisplayEarly} already exists (game #${duplicate.id}). Delete it first if you want to re-upload.`);
  }

  const nextId = manifest.games.length > 0
    ? Math.max(...manifest.games.map((g) => g.id)) + 1
    : 1;

  const boxScore = parseGameCsv(csvText);

  // Derive team totals from box score
  const runsFor = boxScore.batting.reduce((s, p) => s + p.r, 0);
  const teamHits = boxScore.batting.reduce((s, p) => s + p.h, 0);
  const teamErrors = deriveErrors(csvText);
  const runsAgainst = deriveRunsAgainst(csvText);

  const result: "W" | "L" | "T" =
    runsFor > runsAgainst ? "W" : runsFor < runsAgainst ? "L" : "T";

  const d = dEarly;
  const dateDisplay = dateDisplayEarly;
  const dateShort = `${d.getMonth() + 1}/${d.getDate()}`;

  // Store raw CSV
  const csvBlob = await put(`${STATS_PREFIX}game-${nextId}.csv`, csvText, {
    access: "public",
    contentType: "text/csv",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  const entry: GameEntry = {
    id: nextId,
    date: dateDisplay,
    dateShort,
    opponent: meta.opponent,
    runsFor,
    runsAgainst,
    result,
    teamHits,
    teamErrors,
    csvUrl: csvBlob.url,
    uploadedAt: new Date().toISOString(),
    boxScore,
  };

  manifest.games.push(entry);
  await saveManifest(manifest);
  return manifest;
}

// ─── Delete a game ────────────────────────────────────────────────
export async function deleteGame(gameId: number): Promise<StatsManifest> {
  const manifest = await getStatsManifest();
  const game = manifest.games.find((g) => g.id === gameId);
  if (game) {
    try { await del([game.csvUrl]); } catch { /* ignore */ }
  }
  manifest.games = manifest.games.filter((g) => g.id !== gameId);
  await saveManifest(manifest);
  return manifest;
}

// ─── CSV Parsing: Season ──────────────────────────────────────────

function parseSeasonCsv(csvText: string): {
  batting: BattingStats[];
  pitching: PitchingStats[];
} {
  const rows = parseCsvRows(csvText);
  const headers = rows[0]; // row index 0 = header row (row 2 of file, after section header)

  // Column indices for batting
  const col = (name: string) => headers.indexOf(name);

  const batting: BattingStats[] = [];
  const pitching: PitchingStats[] = [];

  // Data rows start at index 1, skip "Totals" row and empty/glossary rows
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || r[0] === "Totals" || r[0] === "Glossary" || r[0] === "") continue;

    const num = parseInt(r[col("Number")], 10);
    const name = `${r[col("First")]} ${r[col("Last")]}`;
    const gp = parseInt(r[col("GP")], 10) || 0;

    // Batting
    batting.push({
      number: num,
      name,
      gp,
      pa: parseInt(r[col("PA")], 10) || 0,
      ab: parseInt(r[col("AB")], 10) || 0,
      avg: formatAvg(r[col("AVG")]),
      obp: formatAvg(r[col("OBP")]),
      ops: formatOps(r[col("OPS")]),
      h: parseInt(r[col("H")], 10) || 0,
      doubles: parseInt(r[col("2B")], 10) || 0,
      triples: parseInt(r[col("3B")], 10) || 0,
      hr: parseInt(r[col("HR")], 10) || 0,
      rbi: parseInt(r[col("RBI")], 10) || 0,
      r: parseInt(r[col("R")], 10) || 0,
      bb: parseInt(r[col("BB")], 10) || 0,
      so: parseInt(r[col("SO")], 10) || 0,
      sb: parseInt(r[col("SB")], 10) || 0,
      hbp: parseInt(r[col("HBP")], 10) || 0,
      qabPct: r[col("QAB%")] || "0.0",
    });

    // Pitching — only include players with IP > 0
    // IP is in the pitching section — need to find the pitching IP column
    const ipStr = r[col("IP")]; // This is the pitching IP column
    const ip = parseFloat(ipStr) || 0;
    if (ip > 0) {
      pitching.push({
        number: num,
        name,
        gp: parseInt(r[headers.indexOf("GP", col("IP"))], 10) || gp,
        ip: ipStr,
        w: parseInt(r[col("W")], 10) || 0,
        l: parseInt(r[col("L")], 10) || 0,
        h: parseInt(r[headers.indexOf("H", col("IP"))], 10) || 0,
        r: parseInt(r[headers.indexOf("R", col("IP"))], 10) || 0,
        er: parseInt(r[col("ER")], 10) || 0,
        bb: parseInt(r[headers.indexOf("BB", col("IP"))], 10) || 0,
        so: parseInt(r[headers.indexOf("SO", col("IP"))], 10) || 0,
        era: r[col("ERA")] || "0.00",
        whip: r[col("WHIP")] || "0.00",
      });
    }
  }

  // Sort pitching by IP desc
  pitching.sort((a, b) => parseFloat(b.ip) - parseFloat(a.ip));

  return { batting, pitching };
}

// ─── CSV Parsing: Game Box Score ──────────────────────────────────

function parseGameCsv(csvText: string): GameBoxScore {
  const rows = parseCsvRows(csvText);
  const headers = rows[0];

  const col = (name: string) => headers.indexOf(name);

  const batting: GameBatting[] = [];
  const pitching: GamePitching[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || r[0] === "Totals" || r[0] === "Glossary" || r[0] === "") continue;

    const num = parseInt(r[col("Number")], 10);
    const name = `${r[col("First")]} ${r[col("Last")]}`;

    batting.push({
      number: num,
      name,
      ab: parseInt(r[col("AB")], 10) || 0,
      r: parseInt(r[col("R")], 10) || 0,
      h: parseInt(r[col("H")], 10) || 0,
      rbi: parseInt(r[col("RBI")], 10) || 0,
      bb: parseInt(r[col("BB")], 10) || 0,
      so: parseInt(r[col("SO")], 10) || 0,
      sb: parseInt(r[col("SB")], 10) || 0,
      hbp: parseInt(r[col("HBP")], 10) || 0,
    });

    // Pitching — only if IP > 0
    const ipStr = r[col("IP")];
    const ip = parseFloat(ipStr) || 0;
    if (ip > 0) {
      pitching.push({
        number: num,
        name,
        ip: ipStr,
        h: parseInt(r[headers.indexOf("H", col("IP"))], 10) || 0,
        r: parseInt(r[headers.indexOf("R", col("IP"))], 10) || 0,
        er: parseInt(r[col("ER")], 10) || 0,
        bb: parseInt(r[headers.indexOf("BB", col("IP"))], 10) || 0,
        so: parseInt(r[headers.indexOf("SO", col("IP"))], 10) || 0,
      });
    }
  }

  return { batting, pitching };
}

// ─── Helpers ──────────────────────────────────────────────────────

function parseCsvRows(csvText: string): string[][] {
  const result = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: true,
  });
  // Row 0 is the section header ("","","","Batting",...), row 1 is column headers
  // Return from row 1 onward (column headers + data)
  return result.data.slice(1);
}

function formatAvg(val: string): string {
  if (!val || val === "-") return ".000";
  const n = parseFloat(val);
  if (isNaN(n)) return ".000";
  return n.toFixed(3).replace(/^0/, "");
}

function formatOps(val: string): string {
  if (!val || val === "-") return ".000";
  const n = parseFloat(val);
  if (isNaN(n)) return ".000";
  if (n >= 1) return n.toFixed(3);
  return n.toFixed(3).replace(/^0/, "");
}

function deriveRunsAgainst(csvText: string): number {
  const rows = parseCsvRows(csvText);
  const headers = rows[0];
  // Pitching R column — runs allowed. Find the R after the IP column (pitching section).
  const ipIdx = headers.indexOf("IP");
  if (ipIdx === -1) return 0;
  const rIdx = headers.indexOf("R", ipIdx);
  if (rIdx === -1) return 0;

  // Use the Totals row if available
  const totalsRow = rows.find((r) => r[0] === "Totals");
  if (totalsRow) {
    return parseInt(totalsRow[rIdx], 10) || 0;
  }

  // Fallback: sum individual pitcher rows
  let total = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || r[0] === "Totals" || r[0] === "Glossary" || r[0] === "") continue;
    const ip = parseFloat(r[ipIdx]) || 0;
    if (ip > 0) {
      total += parseInt(r[rIdx], 10) || 0;
    }
  }
  return total;
}

function deriveErrors(csvText: string): number {
  const rows = parseCsvRows(csvText);
  const headers = rows[0];
  // Find the fielding E column — it's after the "TC" column in the fielding section
  const tcIdx = headers.lastIndexOf("TC");
  if (tcIdx === -1) return 0;
  const eIdx = headers.indexOf("E", tcIdx);
  if (eIdx === -1) return 0;

  // Sum from the Totals row or individual players
  const totalsRow = rows.find((r) => r[0] === "Totals");
  if (totalsRow) {
    return parseInt(totalsRow[eIdx], 10) || 0;
  }

  // Fallback: sum individual rows
  let total = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || r[0] === "Totals" || r[0] === "Glossary" || r[0] === "") continue;
    total += parseInt(r[eIdx], 10) || 0;
  }
  return total;
}
