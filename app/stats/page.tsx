"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, TrendingUp, Target, Zap, Award, Loader2, BarChart3 } from "lucide-react";
import { BaseballIcon, BaseballDiamond, BaseballSeams } from "@/components/BaseballSvg";
import type { BattingStats, PitchingStats, FieldingStats, GameResult, GameBoxScore } from "@/lib/stats";
import {
  BattingAvgChart,
  PlateDisciplineChart,
  ExtraBasePowerChart,
  PitcherDualChart,
  KBBRatioChart,
  RunsTrendChart,
} from "@/components/stats/Charts";

// ─── Helpers ──────────────────────────────────────────────────────

function leader<T>(rows: T[], key: keyof T): number {
  return Math.max(...rows.map((r) => Number(r[key])).filter((v) => !isNaN(v)));
}

// ─── Season Summary Badges ────────────────────────────────────────

function StatBadge({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className="flex items-center gap-3 bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-3.5 min-w-[140px]"
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#6B35A3]/15 text-[#c4a0e8] shrink-0">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[#6a6a6a] text-[10px] uppercase tracking-widest font-medium">
          {label}
        </span>
        <span className="text-white text-lg font-bold leading-tight">{value}</span>
      </div>
    </motion.div>
  );
}

// ─── Leader Spotlight Card ────────────────────────────────────────

function LeaderCard({
  label,
  playerName,
  value,
  sub,
  delay,
}: {
  label: string;
  playerName: string;
  value: string;
  sub: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#1a1228] to-[#0d0d0d] border border-[#6B35A3]/30 rounded-2xl p-5"
    >
      <div className="absolute top-3 right-3 opacity-10">
        <BaseballDiamond size={48} className="text-[#6B35A3]" />
      </div>
      <span className="text-[#8a6aba] text-[10px] uppercase tracking-[0.2em] font-semibold">
        {label}
      </span>
      <div className="mt-2">
        <span className="text-white text-xl font-bold block">{playerName}</span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-[#c4a0e8] text-2xl font-black">{value}</span>
          <span className="text-[#6a6a6a] text-xs">{sub}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Game Card ────────────────────────────────────────────────────

function GameCard({
  game,
  index,
  onClick,
  boxScore,
}: {
  game: GameResult;
  index: number;
  onClick: () => void;
  boxScore?: GameBoxScore;
}) {
  const isWin = game.result === "W";

  // Earned runs "what if" calculation
  const earnedAgainst = boxScore
    ? boxScore.pitching.reduce((s, p) => s + p.er, 0)
    : null;
  const unearned = earnedAgainst !== null ? game.runsAgainst - earnedAgainst : 0;
  const wouldWin = earnedAgainst !== null && game.runsFor > earnedAgainst;
  const flipped = earnedAgainst !== null && game.result !== "W" && wouldWin;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group text-left w-full overflow-hidden rounded-2xl border bg-[#131313] hover:border-[#6B35A3]/40 transition-colors cursor-pointer ${
        flipped ? "border-green-700/30" : "border-[#2a2a2a]"
      }`}
    >
      {/* Top accent line */}
      <div
        className={`h-1 w-full ${
          isWin
            ? "bg-gradient-to-r from-green-600/60 to-green-500/20"
            : flipped
            ? "bg-gradient-to-r from-green-600/30 via-red-600/30 to-red-500/10"
            : "bg-gradient-to-r from-red-600/40 to-red-500/10"
        }`}
      />

      <div className="p-5">
        {/* Header: date + result badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#6a6a6a] text-xs font-medium">{game.date}</span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              isWin
                ? "bg-[#152a15] text-[#8ae88a]"
                : "bg-[#2a1515] text-[#e88a8a]"
            }`}
          >
            {game.result}
          </span>
        </div>

        {/* Opponent */}
        <div className="flex items-center gap-2 mb-4">
          <BaseballIcon size={18} className="text-[#6B35A3] shrink-0" />
          <span className="text-white font-semibold text-sm truncate">
            vs {game.opponent}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-3 py-3 rounded-xl bg-[#0d0d0d] border border-[#1e1e1e]">
          <div className="text-center">
            <span className="text-[#6a6a6a] text-[9px] uppercase tracking-widest block mb-0.5">
              TP
            </span>
            <span className="text-white text-3xl font-black">{game.runsFor}</span>
          </div>
          <span className="text-[#3a3a3a] text-lg font-light">—</span>
          <div className="text-center">
            <span className="text-[#6a6a6a] text-[9px] uppercase tracking-widest block mb-0.5">
              OPP
            </span>
            <span className="text-[#8a8a8a] text-3xl font-black">{game.runsAgainst}</span>
          </div>
        </div>

        {/* Earned runs "what if" */}
        {earnedAgainst !== null && (
          <div className={`mt-2 rounded-lg px-3 py-2 text-center ${
            flipped ? "bg-green-900/15 border border-green-800/20" : "bg-[#0d0d0d]"
          }`}>
            <span className="text-[#5a5a5a] text-[9px] uppercase tracking-widest">
              Without errors
            </span>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              {flipped && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-900/30 text-green-400">
                  W
                </span>
              )}
              <span className={`text-xs font-mono font-bold ${flipped ? "text-green-400" : "text-[#6a6a6a]"}`}>
                {game.runsFor}–{earnedAgainst}
              </span>
              {unearned > 0 ? (
                <span className="text-[#e88a8a] text-[10px]">
                  ({unearned} unearned)
                </span>
              ) : (
                <span className="text-[#3a3a3a] text-[10px]">
                  (all earned)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer: hits + errors + arrow */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-3 text-[11px]">
            <span className="text-[#6a6a6a]">
              <span className="text-[#8a8a8a]">{game.teamHits}</span> H
            </span>
            <span className="text-[#6a6a6a]">
              <span className={game.teamErrors > 2 ? "text-[#e88a8a]" : "text-[#8a8a8a]"}>
                {game.teamErrors}
              </span>{" "}
              E
            </span>
          </div>
          <ChevronRight
            size={14}
            className="text-[#3a3a3a] group-hover:text-[#6B35A3] transition-colors"
          />
        </div>
      </div>
    </motion.button>
  );
}

// ─── Box Score Table ──────────────────────────────────────────────

function BoxScoreTable({
  headers,
  rows,
  highlightCells,
}: {
  headers: string[];
  rows: (string | number)[][];
  highlightCells?: Set<string>; // "row-col" keys for per-cell leader highlighting
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#2a2a2a] bg-[#111]">
            {headers.map((col, i) => (
              <th
                key={col}
                className={`px-3 py-3 text-[10px] font-semibold text-[#5a5a5a] uppercase tracking-wider whitespace-nowrap ${
                  i > 1 ? "text-right" : "text-left"
                }`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, ri) => (
            <tr
              key={ri}
              className={`border-b border-[#1a1a1a] transition-colors hover:bg-[#151515] ${
                ri % 2 === 0 ? "bg-[#0d0d0d]" : "bg-[#101010]"
              }`}
            >
              {cells.map((val, ci) => (
                <td
                  key={ci}
                  className={`px-3 py-2.5 text-sm whitespace-nowrap ${
                    ci > 1 ? "text-right font-mono" : ""
                  } ${
                    ci === 1
                      ? "text-white font-medium"
                      : ci === 0
                      ? "text-[#5a5a5a]"
                      : highlightCells?.has(`${ri}-${ci}`)
                      ? "text-[#c4a0e8] font-semibold"
                      : "text-[#b0b0b0]"
                  }`}
                >
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function StatsPage() {
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [tab, setTab] = useState<"batting" | "pitching" | "fielding">("batting");
  const [loading, setLoading] = useState(true);
  const [seasonName, setSeasonName] = useState("Spring 2026");
  const [battingStats, setBattingStats] = useState<BattingStats[]>([]);
  const [pitchingStats, setPitchingStats] = useState<PitchingStats[]>([]);
  const [fielding, setFielding] = useState<FieldingStats[]>([]);
  const [gameLog, setGameLog] = useState<GameResult[]>([]);
  const [gameBoxScores, setGameBoxScores] = useState<Record<number, GameBoxScore>>({});

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setSeasonName(data.season);
        setBattingStats(data.batting);
        setPitchingStats(data.pitching);
        setFielding(data.fielding ?? []);
        setGameLog(data.gameLog);
        setGameBoxScores(data.gameBoxScores);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGameClick = useCallback((id: number) => {
    setSelectedGame(id);
    setTab("batting");
  }, []);

  const handleBack = useCallback(() => {
    setSelectedGame(null);
  }, []);

  // ─── Season-level computed values ──────────────────────────────

  const sortedGameLog = useMemo(
    () =>
      [...gameLog].sort((a, b) => {
        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return dateDiff !== 0 ? dateDiff : a.id - b.id;
      }),
    [gameLog]
  );

  const record = useMemo(() => {
    const w = gameLog.filter((g) => g.result === "W").length;
    const l = gameLog.filter((g) => g.result === "L").length;
    return `${w}-${l}`;
  }, [gameLog]);

  const teamAvg = useMemo(() => {
    const h = battingStats.reduce((s, p) => s + p.h, 0);
    const ab = battingStats.reduce((s, p) => s + p.ab, 0);
    return ab > 0 ? (h / ab).toFixed(3).replace(/^0/, "") : ".000";
  }, [battingStats]);

  const totalRuns = useMemo(() => gameLog.reduce((s, g) => s + g.runsFor, 0), [gameLog]);
  const totalRBI = useMemo(() => battingStats.reduce((s, p) => s + p.rbi, 0), [battingStats]);
  const totalSB = useMemo(() => battingStats.reduce((s, p) => s + p.sb, 0), [battingStats]);

  const leaders = useMemo(() => {
    const batSorted = [...battingStats].sort(
      (a, b) => parseFloat(b.avg) - parseFloat(a.avg)
    );
    const obpSorted = [...battingStats].sort(
      (a, b) => parseFloat(b.obp) - parseFloat(a.obp)
    );
    const qualifiedPitchers = pitchingStats.filter((p) => parseFloat(p.ip) >= 3);
    const eraSorted = [...qualifiedPitchers].sort(
      (a, b) => parseFloat(a.era) - parseFloat(b.era)
    );
    const soSorted = [...pitchingStats].sort((a, b) => b.so - a.so);

    return {
      avg: batSorted[0],
      obp: obpSorted[0],
      era: eraSorted[0],
      so: soSorted[0],
    };
  }, [battingStats, pitchingStats]);

  // ─── Season batting/pitching leaders for table highlighting ────

  const battingLeaders = useMemo(
    () => ({
      avg: leader(battingStats, "avg"),
      obp: leader(battingStats, "obp"),
      ops: leader(battingStats, "ops"),
      h: leader(battingStats, "h"),
      rbi: leader(battingStats, "rbi"),
      r: leader(battingStats, "r"),
      bb: leader(battingStats, "bb"),
      sb: leader(battingStats, "sb"),
    }),
    [battingStats]
  );

  // ─── Game detail data ──────────────────────────────────────────

  const gameData = selectedGame ? gameBoxScores[selectedGame] : null;
  const gameInfo = selectedGame
    ? gameLog.find((g) => g.id === selectedGame)
    : null;

  // Build table rows for game box score
  const gameBattingRows = useMemo(() => {
    if (!gameData) return [];
    return gameData.batting.map((p) => [
      p.number,
      p.name,
      p.ab,
      p.r,
      p.h,
      p.rbi,
      p.bb,
      p.so,
      p.sb,
      p.hbp,
    ]);
  }, [gameData]);

  const gamePitchingRows = useMemo(() => {
    if (!gameData) return [];
    return gameData.pitching.map((p) => [
      p.number,
      p.name,
      p.ip,
      p.h,
      p.r,
      p.er,
      p.bb,
      p.so,
    ]);
  }, [gameData]);

  // Season table rows
  const seasonBattingRows = useMemo(
    () =>
      battingStats.map((p) => [
        p.number,
        p.name,
        p.gp,
        p.pa,
        p.ab,
        p.avg,
        p.obp,
        p.ops,
        p.h,
        p.doubles,
        p.triples,
        p.hr,
        p.rbi,
        p.r,
        p.bb,
        p.so,
        p.kl ?? "—",
        p.sb,
        p.hbp,
        p.qab ?? "—",
        `${p.qabPct}%`,
        p.ps ?? "—",
        p.psPa ?? "—",
      ]),
    [battingStats]
  );

  const seasonBattingHighlights = useMemo(() => {
    const highlights = new Set<string>();
    // Column indices: 5=AVG, 6=OBP, 7=OPS
    battingStats.forEach((p, ri) => {
      if (Number(p.avg) === battingLeaders.avg && Number(p.avg) > 0) highlights.add(`${ri}-5`);
      if (Number(p.obp) === battingLeaders.obp && Number(p.obp) > 0) highlights.add(`${ri}-6`);
      if (Number(p.ops) === battingLeaders.ops && Number(p.ops) > 0) highlights.add(`${ri}-7`);
    });
    return highlights;
  }, [battingStats, battingLeaders]);

  const seasonPitchingRows = useMemo(
    () =>
      pitchingStats.map((p) => [
        p.number,
        p.name,
        p.gp,
        p.ip,
        p.w,
        p.l,
        p.h,
        p.r,
        p.er,
        p.bb,
        p.so,
        p.bf ?? "—",
        p.np ?? "—",
        p.era,
        p.whip,
      ]),
    [pitchingStats]
  );

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-[#6B35A3] animate-spin" />
          <span className="text-[#6a6a6a] text-sm">Loading stats...</span>
        </div>
      </main>
    );
  }

  const hasData = battingStats.length > 0 || gameLog.length > 0;

  if (!hasData) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <BaseballIcon size={48} />
          <h1 className="text-2xl font-bold text-white">No Stats Yet</h1>
          <p className="text-[#6a6a6a] text-sm max-w-md">
            Season and game stats will appear here once uploaded by a team admin.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <AnimatePresence mode="wait">
        {selectedGame === null ? (
          /* ══════════════════════ SEASON VIEW ══════════════════════ */
          <motion.div
            key="season"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <BaseballIcon size={28} className="text-[#6B35A3]" />
                <h1 className="text-3xl font-bold text-white">Team Stats</h1>
              </div>
              <p className="text-[#6a6a6a] text-sm ml-[40px]">
                Trash Pandas Howard 14U · {seasonName}
              </p>
            </div>

            {/* Season summary badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              <StatBadge label="Record" value={record} icon={<Award size={18} />} />
              <StatBadge label="Team AVG" value={teamAvg} icon={<Target size={18} />} />
              <StatBadge label="Runs" value={String(totalRuns)} icon={<Zap size={18} />} />
              <StatBadge label="RBI" value={String(totalRBI)} icon={<TrendingUp size={18} />} />
              <StatBadge
                label="Stolen Bases"
                value={String(totalSB)}
                icon={<BaseballDiamond size={18} className="text-[#c4a0e8]" />}
              />
            </div>

            <BaseballSeams className="text-[#6B35A3] mb-8" />

            {/* Leader Spotlight */}
            <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <Award size={18} className="text-[#6B35A3]" />
              Season Leaders
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
              {leaders.avg && (
                <LeaderCard
                  label="Batting Average"
                  playerName={leaders.avg.name}
                  value={leaders.avg.avg}
                  sub="AVG"
                  delay={0}
                />
              )}
              {leaders.obp && (
                <LeaderCard
                  label="On-Base Pct"
                  playerName={leaders.obp.name}
                  value={leaders.obp.obp}
                  sub="OBP"
                  delay={0.08}
                />
              )}
              {leaders.era && (
                <LeaderCard
                  label="Earned Run Avg"
                  playerName={leaders.era.name}
                  value={leaders.era.era}
                  sub="ERA (min 3 IP)"
                  delay={0.16}
                />
              )}
              {leaders.so && (
                <LeaderCard
                  label="Strikeouts"
                  playerName={leaders.so.name}
                  value={String(leaders.so.so)}
                  sub="K"
                  delay={0.24}
                />
              )}
            </div>

            <BaseballSeams className="text-[#6B35A3] mb-8" />

            {/* Analytics Charts */}
            <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-[#6B35A3]" />
              Analytics
            </h2>

            {/* Team Charts Row */}
            {gameLog.length > 0 && (
              <div className="mb-6">
                <RunsTrendChart data={gameLog} />
              </div>
            )}

            {/* Hitting Row 1: AVG + Plate Discipline */}
            {battingStats.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <BattingAvgChart data={battingStats} />
                <PlateDisciplineChart data={battingStats} />
              </div>
            )}

            {/* Hitting Row 2: Extra-Base Power */}
            {battingStats.length > 0 && (
              <div className="mb-6">
                <ExtraBasePowerChart data={battingStats} />
              </div>
            )}

            {/* Pitching Row: ERA & WHIP + K/BB Ratio */}
            {pitchingStats.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
                <PitcherDualChart data={pitchingStats} />
                <KBBRatioChart data={pitchingStats} />
              </div>
            )}

            <BaseballSeams className="text-[#6B35A3] mb-8" />

            {/* Game Log */}
            <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <BaseballIcon size={18} className="text-[#6B35A3]" />
              Game Log
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {sortedGameLog.map((game, i) => (
                <GameCard
                  key={game.id}
                  game={game}
                  index={i}
                  onClick={() => handleGameClick(game.id)}
                  boxScore={gameBoxScores[game.id]}
                />
              ))}
            </div>
            <p className="text-[#3a3a3a] text-[11px] mb-10 group/footnote">
              * &ldquo;Without errors&rdquo; shows what if our defense didn&apos;t make errors.{" "}
              <span className="relative inline-block">
                <span className="text-[#5a5a5a] underline decoration-dotted underline-offset-2 cursor-help">
                  Why only ours?
                </span>
                <span className="invisible group-hover/footnote:visible absolute bottom-full left-0 mb-2 w-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[11px] text-[#b0b0b0] shadow-xl z-10 leading-relaxed">
                  Opponent pitching earned runs aren&apos;t available in the GameChanger CSV export, so we can&apos;t determine how many of our runs were unearned (scored because of their errors).
                </span>
              </span>
            </p>

            <BaseballSeams className="text-[#6B35A3] mb-8" />

            {/* Season Stats Tables */}
            <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#6B35A3]" />
              Season Stats
            </h2>

            {/* Tab switcher */}
            <div className="flex gap-1 mb-6 border-b border-[#2a2a2a]">
              {(["batting", "pitching", "fielding"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                    tab === t
                      ? "border-[#6B35A3] text-white"
                      : "border-transparent text-[#6a6a6a] hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "batting" && (
              <BoxScoreTable
                headers={[
                  "#", "Player", "GP", "PA", "AB", "AVG", "OBP", "OPS",
                  "H", "2B", "3B", "HR", "RBI", "R", "BB", "K", "K-L", "SB", "HBP", "QAB", "QAB%", "PS", "PS/PA",
                ]}
                rows={seasonBattingRows}
                highlightCells={seasonBattingHighlights}
              />
            )}
            {tab === "pitching" && (
              <BoxScoreTable
                headers={[
                  "#", "Player", "GP", "IP", "W", "L", "H", "R", "ER", "BB", "K", "BF", "#P", "ERA", "WHIP",
                ]}
                rows={seasonPitchingRows}
              />
            )}
            {tab === "fielding" && (
              <BoxScoreTable
                headers={["#", "Player", "P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"]}
                rows={fielding.map((p) => [
                  p.number,
                  p.name,
                  p.p ?? "—",
                  p.c ?? "—",
                  p.firstBase ?? "—",
                  p.secondBase ?? "—",
                  p.thirdBase ?? "—",
                  p.ss ?? "—",
                  p.lf ?? "—",
                  p.cf ?? "—",
                  p.rf ?? "—",
                ])}
              />
            )}

            <p className="text-[#4a4a4a] text-xs mt-4">
              <span className="text-[#c4a0e8]">Purple</span> = team leader.
              Stats via GameChanger.
            </p>
            {tab === "batting" && (
              <div className="space-y-1 mt-2">
                <p className="text-[#4a4a4a] text-xs">
                  QAB (Quality At-Bat) = a plate appearance where the batter accomplishes a positive outcome: hard contact, walk, HBP, sac, moving a runner, or a long at-bat (6+ pitches).
                </p>
                <p className="text-[#4a4a4a] text-xs">
                  PS (Pitches Seen) = total pitches a batter faced across all plate appearances. PS/PA = average pitches seen per plate appearance — higher means the batter works deeper counts and tires opposing pitchers.
                </p>
              </div>
            )}
            {tab === "fielding" && (
              <p className="text-[#4a4a4a] text-xs mt-2">
                Values = innings played at each position.
              </p>
            )}
          </motion.div>
        ) : (
          /* ══════════════════════ GAME DETAIL VIEW ══════════════════════ */
          <motion.div
            key={`game-${selectedGame}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#6a6a6a] hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="text-sm font-medium">Back to Season</span>
            </button>

            {gameInfo && (
              <>
                {/* Game header */}
                <div className="relative overflow-hidden rounded-2xl border border-[#2a2a2a] bg-gradient-to-br from-[#161616] to-[#0d0d0d] p-6 mb-8">
                  <div className="absolute top-4 right-4 opacity-5">
                    <BaseballIcon size={80} className="text-[#6B35A3]" />
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <BaseballIcon size={20} className="text-[#6B35A3]" />
                    <span className="text-[#6a6a6a] text-sm">{gameInfo.date}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ml-2 ${
                        gameInfo.result === "W"
                          ? "bg-[#152a15] text-[#8ae88a]"
                          : "bg-[#2a1515] text-[#e88a8a]"
                      }`}
                    >
                      {gameInfo.result}
                    </span>
                  </div>
                  <h2 className="text-white text-2xl font-bold mb-4">
                    vs {gameInfo.opponent}
                  </h2>

                  {/* Score display */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl px-6 py-4">
                      <div className="text-center">
                        <span className="text-[#6a6a6a] text-[9px] uppercase tracking-widest block mb-1">
                          Trash Pandas
                        </span>
                        <span className="text-white text-4xl font-black">
                          {gameInfo.runsFor}
                        </span>
                      </div>
                      <span className="text-[#3a3a3a] text-2xl font-light">—</span>
                      <div className="text-center">
                        <span className="text-[#6a6a6a] text-[9px] uppercase tracking-widest block mb-1">
                          {gameInfo.opponent.split(" ").slice(-1)[0]}
                        </span>
                        <span className="text-[#8a8a8a] text-4xl font-black">
                          {gameInfo.runsAgainst}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex flex-col items-center">
                        <span className="text-[#6a6a6a] text-[10px] uppercase tracking-widest">
                          Hits
                        </span>
                        <span className="text-white font-bold text-lg">
                          {gameInfo.teamHits}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[#6a6a6a] text-[10px] uppercase tracking-widest">
                          Errors
                        </span>
                        <span
                          className={`font-bold text-lg ${
                            gameInfo.teamErrors > 2
                              ? "text-[#e88a8a]"
                              : "text-white"
                          }`}
                        >
                          {gameInfo.teamErrors}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <BaseballSeams className="text-[#6B35A3] mb-6" />
              </>
            )}

            {/* Tab switcher */}
            <div className="flex gap-1 mb-6 border-b border-[#2a2a2a]">
              {(["batting", "pitching"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                    tab === t
                      ? "border-[#6B35A3] text-white"
                      : "border-transparent text-[#6a6a6a] hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "batting" && gameBattingRows.length > 0 && (
              <BoxScoreTable
                headers={["#", "Player", "AB", "R", "H", "RBI", "BB", "K", "SB", "HBP"]}
                rows={gameBattingRows}
              />
            )}
            {tab === "pitching" && gamePitchingRows.length > 0 && (
              <BoxScoreTable
                headers={["#", "Player", "IP", "H", "R", "ER", "BB", "K"]}
                rows={gamePitchingRows}
              />
            )}

            <p className="text-[#4a4a4a] text-xs mt-4">
              Stats via GameChanger.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
