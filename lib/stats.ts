// ─── Season-level types ────────────────────────────────────────────
export interface BattingStats {
  number: number;
  name: string;
  gp: number;
  pa: number;
  ab: number;
  avg: string;
  obp: string;
  ops: string;
  h: number;
  doubles: number;
  triples: number;
  hr: number;
  rbi: number;
  r: number;
  bb: number;
  so: number;
  sb: number;
  hbp: number;
  qabPct: string;
}

export interface PitchingStats {
  number: number;
  name: string;
  gp: number;
  ip: string;
  w: number;
  l: number;
  h: number;
  r: number;
  er: number;
  bb: number;
  so: number;
  bf?: number;
  np?: number;
  era: string;
  whip: string;
}

// ─── Game-level types ──────────────────────────────────────────────
export interface GameResult {
  id: number;
  date: string;
  dateShort: string;
  opponent: string;
  runsFor: number;
  runsAgainst: number;
  result: "W" | "L" | "T";
  teamHits: number;
  teamErrors: number;
}

export interface GameBatting {
  number: number;
  name: string;
  ab: number;
  r: number;
  h: number;
  rbi: number;
  bb: number;
  so: number;
  sb: number;
  hbp: number;
}

export interface GamePitching {
  number: number;
  name: string;
  ip: string;
  h: number;
  r: number;
  er: number;
  bb: number;
  so: number;
}

export interface GameBoxScore {
  batting: GameBatting[];
  pitching: GamePitching[];
}

// ─── Constants ─────────────────────────────────────────────────────
export const season = "Spring 2026";

// ─── Season batting ────────────────────────────────────────────────
export const battingStats: BattingStats[] = [
  { number: 2,  name: "Ian Koessel",      gp: 6, pa: 14, ab: 12, avg: ".333", obp: ".429", ops: ".762",  h: 4, doubles: 0, triples: 0, hr: 0, rbi: 1, r: 0, bb: 2, so: 3, sb: 1, hbp: 0, qabPct: "50.0" },
  { number: 5,  name: "Weston Gant",      gp: 6, pa: 12, ab:  8, avg: ".250", obp: ".500", ops: ".875",  h: 2, doubles: 1, triples: 0, hr: 0, rbi: 0, r: 1, bb: 3, so: 5, sb: 0, hbp: 1, qabPct: "41.7" },
  { number: 6,  name: "Nikko Johnson",    gp: 6, pa: 12, ab: 10, avg: ".200", obp: ".333", ops: ".633",  h: 2, doubles: 1, triples: 0, hr: 0, rbi: 0, r: 2, bb: 2, so: 7, sb: 1, hbp: 0, qabPct: "41.7" },
  { number: 7,  name: "Gavin Sagan",      gp: 6, pa: 13, ab:  9, avg: ".000", obp: ".308", ops: ".308",  h: 0, doubles: 0, triples: 0, hr: 0, rbi: 1, r: 1, bb: 4, so: 4, sb: 1, hbp: 0, qabPct: "61.5" },
  { number: 8,  name: "Brendon Stahl",    gp: 6, pa: 14, ab: 13, avg: ".154", obp: ".214", ops: ".445",  h: 2, doubles: 1, triples: 0, hr: 0, rbi: 3, r: 4, bb: 1, so: 3, sb: 3, hbp: 0, qabPct: "42.9" },
  { number: 10, name: "Chase Baker",      gp: 6, pa: 13, ab: 12, avg: ".167", obp: ".231", ops: ".397",  h: 2, doubles: 0, triples: 0, hr: 0, rbi: 1, r: 1, bb: 1, so: 7, sb: 2, hbp: 0, qabPct: "7.7"  },
  { number: 16, name: "Chase Howard",     gp: 6, pa: 14, ab:  9, avg: ".333", obp: ".571", ops: ".905",  h: 3, doubles: 0, triples: 0, hr: 0, rbi: 1, r: 1, bb: 4, so: 2, sb: 1, hbp: 1, qabPct: "57.1" },
  { number: 22, name: "Tony Moore",       gp: 6, pa: 14, ab: 10, avg: ".600", obp: ".714", ops: "1.714", h: 6, doubles: 2, triples: 1, hr: 0, rbi: 6, r: 3, bb: 4, so: 1, sb: 1, hbp: 0, qabPct: "85.7" },
  { number: 27, name: "John Hunze",       gp: 6, pa: 12, ab: 10, avg: ".000", obp: ".167", ops: ".167",  h: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 1, bb: 2, so: 4, sb: 0, hbp: 0, qabPct: "33.3" },
  { number: 31, name: "Owen Williams",    gp: 6, pa: 13, ab:  9, avg: ".222", obp: ".462", ops: ".684",  h: 2, doubles: 0, triples: 0, hr: 0, rbi: 2, r: 1, bb: 2, so: 4, sb: 1, hbp: 2, qabPct: "15.4" },
  { number: 50, name: "Scott Rosenthal",  gp: 3, pa:  7, ab:  6, avg: ".333", obp: ".429", ops: ".929",  h: 2, doubles: 1, triples: 0, hr: 0, rbi: 2, r: 1, bb: 1, so: 4, sb: 0, hbp: 0, qabPct: "71.4" },
  { number: 76, name: "Ethan Naliborski", gp: 3, pa:  5, ab:  4, avg: ".000", obp: ".200", ops: ".200",  h: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 2, bb: 1, so: 4, sb: 1, hbp: 0, qabPct: "20.0" },
  { number: 99, name: "Kristian Reese",   gp: 6, pa:  9, ab:  6, avg: ".167", obp: ".444", ops: ".611",  h: 1, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 2, bb: 3, so: 3, sb: 2, hbp: 0, qabPct: "33.3" },
];

// ─── Season pitching (IP > 0, sorted by IP desc) ──────────────────
export const pitchingStats: PitchingStats[] = [
  { number: 8,  name: "Brendon Stahl",   gp: 2, ip: "7.2", w: 0, l: 2, h: 10, r: 13, er: 6, bb: 10, so: 10, era: "5.48",  whip: "2.61" },
  { number: 22, name: "Tony Moore",      gp: 2, ip: "6.2", w: 0, l: 1, h:  7, r: 12, er: 3, bb:  9, so: 11, era: "3.15",  whip: "2.40" },
  { number: 31, name: "Owen Williams",   gp: 3, ip: "5.2", w: 0, l: 1, h: 11, r: 12, er: 9, bb:  4, so:  5, era: "11.12", whip: "2.65" },
  { number: 50, name: "Scott Rosenthal", gp: 1, ip: "5.0", w: 0, l: 1, h: 12, r:  9, er: 9, bb:  1, so:  4, era: "12.60", whip: "2.60" },
  { number: 5,  name: "Weston Gant",     gp: 1, ip: "1.0", w: 0, l: 0, h:  2, r: 10, er: 0, bb:  5, so:  1, era: "0.00",  whip: "7.00" },
  { number: 27, name: "John Hunze",      gp: 1, ip: "1.0", w: 0, l: 1, h:  1, r:  2, er: 2, bb:  2, so:  0, era: "14.00", whip: "3.00" },
  { number: 16, name: "Chase Howard",    gp: 1, ip: "0.2", w: 0, l: 0, h:  1, r:  1, er: 1, bb:  3, so:  1, era: "10.50", whip: "6.00" },
];

// ─── Game log ──────────────────────────────────────────────────────
export const gameLog: GameResult[] = [
  { id: 1, date: "March 21, 2026", dateShort: "3/21", opponent: "Columbia Baseball Club",       runsFor: 0, runsAgainst: 8,  result: "L", teamHits: 2,  teamErrors: 4 },
  { id: 2, date: "March 21, 2026", dateShort: "3/21", opponent: "Gamers Academy Rappaport",     runsFor: 1, runsAgainst: 15, result: "L", teamHits: 1,  teamErrors: 6 },
  { id: 3, date: "March 28, 2026", dateShort: "3/28", opponent: "Midwest Storm",                runsFor: 3, runsAgainst: 9,  result: "L", teamHits: 5,  teamErrors: 1 },
  { id: 4, date: "March 22, 2026", dateShort: "3/22", opponent: "Blue Jays",                    runsFor: 8, runsAgainst: 9,  result: "L", teamHits: 10, teamErrors: 1 },
  { id: 5, date: "March 28, 2026", dateShort: "3/28", opponent: "Columbia Baseball Club",       runsFor: 3, runsAgainst: 11, result: "L", teamHits: 2,  teamErrors: 3 },
  { id: 6, date: "March 29, 2026", dateShort: "3/29", opponent: "Eagles",                       runsFor: 5, runsAgainst: 7,  result: "L", teamHits: 6,  teamErrors: 7 },
];

// ─── Game box scores ───────────────────────────────────────────────
export const gameBoxScores: Record<number, GameBoxScore> = {
  // ── Game 1: vs Columbia Baseball Club (3/21) ─────────────────────
  1: {
    batting: [
      { number: 2,  name: "Ian Koessel",      ab: 2, r: 0, h: 1, rbi: 0, bb: 0, so: 0, sb: 0, hbp: 0 },
      { number: 5,  name: "Weston Gant",      ab: 2, r: 0, h: 1, rbi: 0, bb: 0, so: 1, sb: 0, hbp: 0 },
      { number: 6,  name: "Nikko Johnson",    ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 2, sb: 0, hbp: 0 },
      { number: 7,  name: "Gavin Sagan",      ab: 0, r: 0, h: 0, rbi: 0, bb: 2, so: 0, sb: 0, hbp: 0 },
      { number: 8,  name: "Brendon Stahl",    ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 0, sb: 0, hbp: 0 },
      { number: 10, name: "Chase Baker",      ab: 1, r: 0, h: 0, rbi: 0, bb: 0, so: 1, sb: 0, hbp: 0 },
      { number: 16, name: "Chase Howard",     ab: 1, r: 0, h: 0, rbi: 0, bb: 0, so: 1, sb: 0, hbp: 1 },
      { number: 22, name: "Tony Moore",       ab: 1, r: 0, h: 0, rbi: 0, bb: 1, so: 0, sb: 0, hbp: 0 },
      { number: 27, name: "John Hunze",       ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 1, sb: 0, hbp: 0 },
      { number: 31, name: "Owen Williams",    ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 1, sb: 0, hbp: 0 },
      { number: 50, name: "Scott Rosenthal",  ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 2, sb: 0, hbp: 0 },
      { number: 99, name: "Kristian Reese",   ab: 0, r: 0, h: 0, rbi: 0, bb: 1, so: 0, sb: 0, hbp: 0 },
    ],
    pitching: [
      { number: 8,  name: "Brendon Stahl",  ip: "4.2", h: 6, r: 8, er: 4, bb: 5, so: 6 },
      { number: 31, name: "Owen Williams",  ip: "0.1", h: 0, r: 0, er: 0, bb: 0, so: 0 },
    ],
  },

  // ── Game 2: vs Gamers Academy Rappaport (3/21) ───────────────────
  2: {
    batting: [
      { number: 2,  name: "Ian Koessel",      ab: 0, r: 0, h: 0, rbi: 0, bb: 2, so: 0, sb: 0, hbp: 0 },
      { number: 5,  name: "Weston Gant",      ab: 1, r: 0, h: 0, rbi: 0, bb: 1, so: 1, sb: 0, hbp: 0 },
      { number: 6,  name: "Nikko Johnson",    ab: 0, r: 0, h: 0, rbi: 0, bb: 2, so: 0, sb: 0, hbp: 0 },
      { number: 7,  name: "Gavin Sagan",      ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 1, sb: 0, hbp: 0 },
      { number: 8,  name: "Brendon Stahl",    ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 1, sb: 0, hbp: 0 },
      { number: 10, name: "Chase Baker",      ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 2, sb: 0, hbp: 0 },
      { number: 16, name: "Chase Howard",     ab: 1, r: 0, h: 1, rbi: 1, bb: 1, so: 0, sb: 0, hbp: 0 },
      { number: 22, name: "Tony Moore",       ab: 0, r: 1, h: 0, rbi: 0, bb: 2, so: 0, sb: 0, hbp: 0 },
      { number: 27, name: "John Hunze",       ab: 1, r: 0, h: 0, rbi: 0, bb: 1, so: 0, sb: 0, hbp: 0 },
      { number: 31, name: "Owen Williams",    ab: 1, r: 0, h: 0, rbi: 0, bb: 1, so: 0, sb: 0, hbp: 0 },
      { number: 76, name: "Ethan Naliborski", ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 2, sb: 0, hbp: 0 },
      { number: 99, name: "Kristian Reese",   ab: 1, r: 0, h: 0, rbi: 0, bb: 1, so: 0, sb: 0, hbp: 0 },
    ],
    pitching: [
      { number: 5,  name: "Weston Gant",    ip: "1.0", h: 2, r: 10, er: 0, bb: 5, so: 1 },
      { number: 8,  name: "Brendon Stahl",  ip: "3.0", h: 4, r:  5, er: 2, bb: 5, so: 4 },
    ],
  },

  // ── Game 3: vs Midwest Storm (3/21) ──────────────────────────────
  3: {
    batting: [
      { number: 2,  name: "Ian Koessel",      ab: 2, r: 0, h: 1, rbi: 1, bb: 0, so: 0, sb: 0, hbp: 0 },
      { number: 5,  name: "Weston Gant",      ab: 1, r: 0, h: 0, rbi: 0, bb: 0, so: 2, sb: 0, hbp: 0 },
      { number: 6,  name: "Nikko Johnson",    ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 2, sb: 0, hbp: 0 },
      { number: 7,  name: "Gavin Sagan",      ab: 2, r: 1, h: 0, rbi: 0, bb: 0, so: 0, sb: 0, hbp: 0 },
      { number: 8,  name: "Brendon Stahl",    ab: 2, r: 1, h: 0, rbi: 0, bb: 0, so: 0, sb: 1, hbp: 0 },
      { number: 10, name: "Chase Baker",      ab: 2, r: 0, h: 2, rbi: 1, bb: 0, so: 0, sb: 1, hbp: 0 },
      { number: 16, name: "Chase Howard",     ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 1, sb: 0, hbp: 0 },
      { number: 22, name: "Tony Moore",       ab: 2, r: 0, h: 1, rbi: 0, bb: 0, so: 0, sb: 0, hbp: 0 },
      { number: 27, name: "John Hunze",       ab: 2, r: 1, h: 0, rbi: 0, bb: 0, so: 0, sb: 0, hbp: 0 },
      { number: 31, name: "Owen Williams",    ab: 1, r: 0, h: 1, rbi: 0, bb: 0, so: 0, sb: 1, hbp: 1 },
      { number: 50, name: "Scott Rosenthal",  ab: 1, r: 0, h: 0, rbi: 0, bb: 1, so: 1, sb: 0, hbp: 0 },
      { number: 99, name: "Kristian Reese",   ab: 1, r: 0, h: 0, rbi: 0, bb: 0, so: 0, sb: 0, hbp: 0 },
    ],
    pitching: [
      { number: 22, name: "Tony Moore",     ip: "2.0", h: 2, r: 5, er: 3, bb: 6, so: 3 },
      { number: 27, name: "John Hunze",     ip: "1.0", h: 1, r: 2, er: 2, bb: 2, so: 0 },
      { number: 31, name: "Owen Williams",  ip: "2.0", h: 2, r: 2, er: 1, bb: 2, so: 2 },
    ],
  },

  // ── Game 4: vs Blue Jays (3/22) ──────────────────────────────────
  4: {
    batting: [
      { number: 2,  name: "Ian Koessel",      ab: 3, r: 0, h: 1, rbi: 0, bb: 0, so: 2, sb: 0, hbp: 0 },
      { number: 5,  name: "Weston Gant",      ab: 1, r: 1, h: 1, rbi: 0, bb: 1, so: 0, sb: 0, hbp: 0 },
      { number: 6,  name: "Nikko Johnson",    ab: 3, r: 0, h: 1, rbi: 0, bb: 0, so: 2, sb: 0, hbp: 0 },
      { number: 7,  name: "Gavin Sagan",      ab: 2, r: 0, h: 0, rbi: 1, bb: 1, so: 2, sb: 0, hbp: 0 },
      { number: 8,  name: "Brendon Stahl",    ab: 2, r: 1, h: 0, rbi: 0, bb: 1, so: 1, sb: 1, hbp: 0 },
      { number: 10, name: "Chase Baker",      ab: 3, r: 1, h: 0, rbi: 0, bb: 0, so: 1, sb: 1, hbp: 0 },
      { number: 16, name: "Chase Howard",     ab: 2, r: 1, h: 1, rbi: 0, bb: 1, so: 0, sb: 0, hbp: 0 },
      { number: 22, name: "Tony Moore",       ab: 3, r: 2, h: 2, rbi: 2, bb: 0, so: 0, sb: 1, hbp: 0 },
      { number: 27, name: "John Hunze",       ab: 2, r: 0, h: 0, rbi: 0, bb: 1, so: 0, sb: 0, hbp: 0 },
      { number: 31, name: "Owen Williams",    ab: 3, r: 0, h: 1, rbi: 2, bb: 0, so: 2, sb: 0, hbp: 0 },
      { number: 50, name: "Scott Rosenthal",  ab: 3, r: 1, h: 2, rbi: 2, bb: 0, so: 1, sb: 0, hbp: 0 },
      { number: 99, name: "Kristian Reese",   ab: 2, r: 1, h: 1, rbi: 0, bb: 0, so: 1, sb: 1, hbp: 0 },
    ],
    pitching: [
      { number: 50, name: "Scott Rosenthal", ip: "5.0", h: 12, r: 9, er: 9, bb: 1, so: 4 },
    ],
  },

  // ── Game 5: vs Columbia Baseball Club (3/28) ─────────────────────
  5: {
    batting: [
      { number: 2,  name: "Ian Koessel",      ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 0, sb: 0, hbp: 0 },
      { number: 5,  name: "Weston Gant",      ab: 1, r: 0, h: 0, rbi: 0, bb: 1, so: 1, sb: 0, hbp: 0 },
      { number: 6,  name: "Nikko Johnson",    ab: 1, r: 0, h: 0, rbi: 0, bb: 0, so: 1, sb: 0, hbp: 0 },
      { number: 7,  name: "Gavin Sagan",      ab: 1, r: 0, h: 0, rbi: 0, bb: 1, so: 1, sb: 0, hbp: 0 },
      { number: 8,  name: "Brendon Stahl",    ab: 2, r: 1, h: 1, rbi: 1, bb: 0, so: 0, sb: 0, hbp: 0 },
      { number: 10, name: "Chase Baker",      ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 2, sb: 0, hbp: 0 },
      { number: 16, name: "Chase Howard",     ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 0, sb: 0, hbp: 0 },
      { number: 22, name: "Tony Moore",       ab: 1, r: 0, h: 1, rbi: 2, bb: 1, so: 0, sb: 0, hbp: 0 },
      { number: 27, name: "John Hunze",       ab: 1, r: 0, h: 0, rbi: 0, bb: 0, so: 1, sb: 0, hbp: 0 },
      { number: 31, name: "Owen Williams",    ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 1, sb: 0, hbp: 0 },
      { number: 76, name: "Ethan Naliborski", ab: 0, r: 1, h: 0, rbi: 0, bb: 1, so: 0, sb: 0, hbp: 0 },
      { number: 99, name: "Kristian Reese",   ab: 0, r: 1, h: 0, rbi: 0, bb: 1, so: 0, sb: 1, hbp: 0 },
    ],
    pitching: [
      { number: 16, name: "Chase Howard",   ip: "0.2", h: 1,  r: 1,  er: 1, bb: 3, so: 1 },
      { number: 31, name: "Owen Williams",  ip: "3.1", h: 9,  r: 10, er: 8, bb: 2, so: 3 },
    ],
  },

  // ── Game 6: vs Eagles (3/29) ─────────────────────────────────────
  6: {
    batting: [
      { number: 2,  name: "Ian Koessel",      ab: 3, r: 0, h: 1, rbi: 0, bb: 0, so: 1, sb: 1, hbp: 0 },
      { number: 5,  name: "Weston Gant",      ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 0, sb: 0, hbp: 1 },
      { number: 6,  name: "Nikko Johnson",    ab: 2, r: 2, h: 1, rbi: 0, bb: 0, so: 0, sb: 1, hbp: 0 },
      { number: 7,  name: "Gavin Sagan",      ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 0, sb: 1, hbp: 0 },
      { number: 8,  name: "Brendon Stahl",    ab: 3, r: 1, h: 1, rbi: 2, bb: 0, so: 1, sb: 1, hbp: 0 },
      { number: 10, name: "Chase Baker",      ab: 2, r: 0, h: 0, rbi: 0, bb: 1, so: 1, sb: 0, hbp: 0 },
      { number: 16, name: "Chase Howard",     ab: 1, r: 0, h: 1, rbi: 0, bb: 2, so: 0, sb: 1, hbp: 0 },
      { number: 22, name: "Tony Moore",       ab: 3, r: 0, h: 2, rbi: 2, bb: 0, so: 1, sb: 0, hbp: 0 },
      { number: 27, name: "John Hunze",       ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 2, sb: 0, hbp: 0 },
      { number: 31, name: "Owen Williams",    ab: 0, r: 1, h: 0, rbi: 0, bb: 1, so: 0, sb: 0, hbp: 1 },
      { number: 76, name: "Ethan Naliborski", ab: 2, r: 1, h: 0, rbi: 0, bb: 0, so: 2, sb: 1, hbp: 0 },
      { number: 99, name: "Kristian Reese",   ab: 2, r: 0, h: 0, rbi: 0, bb: 0, so: 2, sb: 0, hbp: 0 },
    ],
    pitching: [
      { number: 22, name: "Tony Moore", ip: "4.2", h: 5, r: 7, er: 0, bb: 3, so: 8 },
    ],
  },
};
