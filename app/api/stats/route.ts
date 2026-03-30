import { NextResponse } from "next/server";
import { getStatsManifest } from "@/lib/stats-store";
import type { BattingStats, PitchingStats, GameResult, GameBoxScore } from "@/lib/stats";

export const dynamic = "force-dynamic";

export interface StatsResponse {
  season: string;
  batting: BattingStats[];
  pitching: PitchingStats[];
  gameLog: GameResult[];
  gameBoxScores: Record<number, GameBoxScore>;
}

export async function GET() {
  try {
    const manifest = await getStatsManifest();

    const batting: BattingStats[] = manifest.season?.batting ?? [];
    const pitching: PitchingStats[] = manifest.season?.pitching ?? [];

    const gameLog: GameResult[] = manifest.games.map((g) => ({
      id: g.id,
      date: g.date,
      dateShort: g.dateShort,
      opponent: g.opponent,
      runsFor: g.runsFor,
      runsAgainst: g.runsAgainst,
      result: g.result,
      teamHits: g.teamHits,
      teamErrors: g.teamErrors,
    }));

    const gameBoxScores: Record<number, GameBoxScore> = {};
    for (const g of manifest.games) {
      gameBoxScores[g.id] = g.boxScore;
    }

    const response: StatsResponse = {
      season: "Spring 2026",
      batting,
      pitching,
      gameLog,
      gameBoxScores,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Stats fetch error:", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
