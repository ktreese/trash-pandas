"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  LineChart,
  Line,
  Legend,
  ReferenceLine,
} from "recharts";
import type { BattingStats, PitchingStats, GameResult, GameBoxScore } from "@/lib/stats";

// ─── Shared ──────────────────────────────────────────────────────

const PURPLE = "#6B35A3";
const PURPLE_LIGHT = "#c4a0e8";
const GREEN = "#4ade80";
const RED = "#f87171";
const ORANGE = "#fb923c";
const GRAY = "#5a5a5a";
const BG = "#131313";

function ChartCard({
  title,
  subtitle,
  tooltip,
  children,
}: {
  title: string;
  subtitle?: string;
  tooltip?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#131313] border border-[#2a2a2a] rounded-2xl p-5">
      <h3 className="text-white font-semibold text-sm mb-0.5">{title}</h3>
      {(subtitle || tooltip) && (
        <p className="text-[#5a5a5a] text-[11px] mb-4">
          {subtitle}
          {tooltip && (
            <span className="relative inline-block ml-1 group/tip">
              <span className="text-[#6a6a6a] cursor-help underline decoration-dotted underline-offset-2">?</span>
              <span className="invisible group-hover/tip:visible absolute bottom-full left-0 mb-2 w-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[11px] text-[#b0b0b0] shadow-xl z-10 leading-relaxed">
                {tooltip}
              </span>
            </span>
          )}
        </p>
      )}
      {!subtitle && !tooltip && <div className="mb-4" />}
      {children}
    </div>
  );
}

function lastName(name: string): string {
  const parts = name.split(" ");
  return parts.length > 1 ? parts[parts.length - 1] : name;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white font-medium mb-1">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color }} className="text-[11px]">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ─── 1. Batting Average Leaders ──────────────────────────────────

export function BattingAvgChart({ data }: { data: BattingStats[] }) {
  const sorted = [...data]
    .filter((p) => p.ab >= 5)
    .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg))
    .slice(0, 12);

  const chartData = sorted.map((p) => ({
    name: lastName(p.name),
    avg: parseFloat(p.avg),
    fullName: p.name,
  }));

  const maxVal = Math.max(...chartData.map((d) => d.avg));

  return (
    <ChartCard title="Batting Average" subtitle="Min 5 AB, sorted by AVG">
      <ResponsiveContainer width="100%" height={sorted.length * 36 + 20}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" horizontal={false} />
          <XAxis type="number" domain={[0, Math.ceil(maxVal * 10) / 10 + 0.05]} tickFormatter={(v: number) => v.toFixed(3)} tick={{ fill: GRAY, fontSize: 10 }} axisLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#b0b0b0", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
          <Tooltip cursor={false} content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs shadow-xl">
                <p className="text-white font-medium">{d.fullName}</p>
                <p className="text-[#c4a0e8]">AVG: {d.avg.toFixed(3)}</p>
              </div>
            );
          }} />
          <Bar dataKey="avg" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.avg === maxVal ? PURPLE_LIGHT : PURPLE} fillOpacity={entry.avg === maxVal ? 1 : 0.6 + (0.4 * (sorted.length - i)) / sorted.length} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── 2. Plate Discipline (BB% vs K%) ────────────────────────────

export function PlateDisciplineChart({ data }: { data: BattingStats[] }) {
  const chartData = data
    .filter((p) => p.pa >= 5)
    .map((p) => ({
      name: lastName(p.name),
      fullName: p.name,
      bbPct: p.pa > 0 ? ((p.bb / p.pa) * 100) : 0,
      kPct: p.pa > 0 ? ((p.so / p.pa) * 100) : 0,
    }));

  // Calculate midpoints for quadrant dividers
  const maxBB = Math.max(...chartData.map((d) => d.bbPct));
  const maxK = Math.max(...chartData.map((d) => d.kPct));
  const midBB = maxBB / 2;
  const midK = maxK / 2;

  return (
    <ChartCard title="Plate Discipline" subtitle="Walk rate vs strikeout rate (min 5 PA). Hover a dot for player details.">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ left: 10, right: 20, top: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
          <XAxis type="number" dataKey="bbPct" name="BB%" tickFormatter={(v: number) => `${v.toFixed(0)}%`} tick={{ fill: GRAY, fontSize: 10 }} axisLine={{ stroke: "#2a2a2a" }} label={{ value: "Walk %  →", position: "insideBottom", offset: -12, fill: GRAY, fontSize: 10 }} />
          <YAxis type="number" dataKey="kPct" name="K%" tickFormatter={(v: number) => `${v.toFixed(0)}%`} tick={{ fill: GRAY, fontSize: 10 }} axisLine={{ stroke: "#2a2a2a" }} label={{ value: "← Strikeout %", angle: -90, position: "insideLeft", offset: 5, fill: GRAY, fontSize: 10 }} />
          <ReferenceLine x={midBB} stroke="#2a2a2a" strokeDasharray="6 4" />
          <ReferenceLine y={midK} stroke="#2a2a2a" strokeDasharray="6 4" />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            const goodEye = d.bbPct >= midBB && d.kPct <= midK;
            const poorEye = d.bbPct < midBB && d.kPct > midK;
            const label = goodEye ? "Patient & selective" : poorEye ? "Chasing pitches" : d.bbPct >= midBB ? "High volume" : "Aggressive hitter";
            return (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs shadow-xl">
                <p className="text-white font-semibold">{d.fullName}</p>
                <p className="text-[#c4a0e8]">Walk %: {d.bbPct.toFixed(1)}%</p>
                <p className="text-[#e88a8a]">Strikeout %: {d.kPct.toFixed(1)}%</p>
                <p className="text-[#6a6a6a] mt-1 italic">{label}</p>
              </div>
            );
          }} />
          <Scatter data={chartData} fill={PURPLE}>
            {chartData.map((entry, i) => {
              const goodEye = entry.bbPct >= midBB && entry.kPct <= midK;
              const poorEye = entry.bbPct < midBB && entry.kPct > midK;
              return (
                <Cell
                  key={i}
                  fill={goodEye ? GREEN : poorEye ? RED : entry.bbPct >= midBB ? PURPLE_LIGHT : ORANGE}
                  fillOpacity={0.85}
                  r={7}
                />
              );
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Quadrant guide */}
      <div className="mt-5 rounded-xl bg-[#0d0d0d] border border-[#1e1e1e] p-4">
        <p className="text-[#6a6a6a] text-[10px] uppercase tracking-widest font-medium mb-3">Reading the chart</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full shrink-0" style={{ backgroundColor: `${GREEN}20`, border: `1.5px solid ${GREEN}` }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GREEN }} />
            </span>
            <div>
              <span className="text-[#e0e0e0] text-[11px] font-semibold block">Patient &amp; selective</span>
              <span className="text-[#8a8a8a] text-[10px]">Walks more, strikes out less</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full shrink-0" style={{ backgroundColor: `${RED}20`, border: `1.5px solid ${RED}` }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: RED }} />
            </span>
            <div>
              <span className="text-[#e0e0e0] text-[11px] font-semibold block">Chasing pitches</span>
              <span className="text-[#8a8a8a] text-[10px]">Swings at bad pitches, strikes out</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full shrink-0" style={{ backgroundColor: `${ORANGE}20`, border: `1.5px solid ${ORANGE}` }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ORANGE }} />
            </span>
            <div>
              <span className="text-[#e0e0e0] text-[11px] font-semibold block">Aggressive hitter</span>
              <span className="text-[#8a8a8a] text-[10px]">Swings early, makes contact</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full shrink-0" style={{ backgroundColor: `${PURPLE_LIGHT}20`, border: `1.5px solid ${PURPLE_LIGHT}` }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PURPLE_LIGHT }} />
            </span>
            <div>
              <span className="text-[#e0e0e0] text-[11px] font-semibold block">High volume</span>
              <span className="text-[#8a8a8a] text-[10px]">Works deep counts both ways</span>
            </div>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

// ─── 3. Extra-Base Power ─────────────────────────────────────────

export function ExtraBasePowerChart({ data }: { data: BattingStats[] }) {
  const withXBH = data
    .map((p) => ({
      name: lastName(p.name),
      fullName: p.name,
      "2B": p.doubles,
      "3B": p.triples,
      HR: p.hr,
      total: p.doubles + p.triples + p.hr,
    }))
    .filter((p) => p.total > 0)
    .sort((a, b) => b.total - a.total);

  if (withXBH.length === 0) return null;

  return (
    <ChartCard title="Extra-Base Hits" subtitle="Doubles, triples, and home runs">
      <ResponsiveContainer width="100%" height={withXBH.length * 36 + 20}>
        <BarChart data={withXBH} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fill: GRAY, fontSize: 10 }} axisLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#b0b0b0", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
          <Tooltip cursor={false} content={CustomTooltip} />
          <Bar dataKey="2B" stackId="xbh" fill="#7c3aed" radius={[0, 0, 0, 0]} maxBarSize={22} name="Doubles" />
          <Bar dataKey="3B" stackId="xbh" fill="#a78bfa" radius={[0, 0, 0, 0]} maxBarSize={22} name="Triples" />
          <Bar dataKey="HR" stackId="xbh" fill={PURPLE_LIGHT} radius={[0, 4, 4, 0]} maxBarSize={22} name="Home Runs" />
          <Legend wrapperStyle={{ fontSize: 11, color: GRAY, paddingTop: 8 }} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── 4. Pitcher ERA + WHIP ───────────────────────────────────────

export function PitcherDualChart({ data }: { data: PitchingStats[] }) {
  const qualified = data.filter((p) => parseFloat(p.ip) >= 1);
  if (qualified.length === 0) return null;

  const chartData = qualified
    .sort((a, b) => parseFloat(a.era) - parseFloat(b.era))
    .map((p) => ({
      name: lastName(p.name),
      fullName: p.name,
      ERA: parseFloat(p.era),
      WHIP: parseFloat(p.whip),
      ip: p.ip,
    }));

  return (
    <ChartCard title="Pitcher ERA & WHIP" subtitle="Lower is better. Sorted by ERA">
      <ResponsiveContainer width="100%" height={qualified.length * 44 + 40}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" horizontal={false} />
          <XAxis type="number" tick={{ fill: GRAY, fontSize: 10 }} axisLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#b0b0b0", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
          <Tooltip cursor={false} content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs shadow-xl">
                <p className="text-white font-medium">{d.fullName}</p>
                <p className="text-[#5a5a5a]">IP: {d.ip}</p>
                <p className="text-[#c4a0e8]">ERA: {d.ERA.toFixed(2)}</p>
                <p className="text-[#a78bfa]">WHIP: {d.WHIP.toFixed(2)}</p>
              </div>
            );
          }} />
          <Bar dataKey="ERA" fill={PURPLE} radius={[0, 4, 4, 0]} maxBarSize={18} name="ERA" />
          <Bar dataKey="WHIP" fill="#a78bfa" radius={[0, 4, 4, 0]} maxBarSize={18} name="WHIP" />
          <Legend wrapperStyle={{ fontSize: 11, color: GRAY, paddingTop: 8 }} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── 5. K/BB Ratio ───────────────────────────────────────────────

export function KBBRatioChart({ data }: { data: PitchingStats[] }) {
  const qualified = data.filter((p) => parseFloat(p.ip) >= 1);
  if (qualified.length === 0) return null;

  const chartData = qualified
    .map((p) => ({
      name: lastName(p.name),
      fullName: p.name,
      ratio: p.bb > 0 ? p.so / p.bb : p.so,
      so: p.so,
      bb: p.bb,
      ip: p.ip,
    }))
    .sort((a, b) => b.ratio - a.ratio);

  return (
    <ChartCard title="Pitching: K/BB Ratio" subtitle="Strikeouts per walk issued" tooltip="Measures pitcher command. Green (2+) is elite — striking out twice as many as they walk. Red (<1) means more walks than strikeouts, indicating control problems.">
      <ResponsiveContainer width="100%" height={qualified.length * 36 + 20}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" horizontal={false} />
          <XAxis type="number" tick={{ fill: GRAY, fontSize: 10 }} axisLine={false} tickFormatter={(v: number) => v.toFixed(1)} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#b0b0b0", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
          <Tooltip cursor={false} content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs shadow-xl">
                <p className="text-white font-medium">{d.fullName}</p>
                <p className="text-[#c4a0e8]">K/BB: {d.ratio.toFixed(2)}</p>
                <p className="text-[#5a5a5a]">{d.so} K / {d.bb} BB ({d.ip} IP)</p>
              </div>
            );
          }} />
          <Bar dataKey="ratio" radius={[0, 4, 4, 0]} maxBarSize={22} name="K/BB">
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.ratio >= 2 ? GREEN : entry.ratio >= 1 ? PURPLE : RED} fillOpacity={0.8} />
            ))}
          </Bar>
          <ReferenceLine x={2} stroke={GREEN} strokeDasharray="4 4" strokeOpacity={0.4} />
          <ReferenceLine x={1} stroke={RED} strokeDasharray="4 4" strokeOpacity={0.3} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── 7. Cumulative Runs Trend ────────────────────────────────────

export function RunsTrendChart({ data }: { data: GameResult[] }) {
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id - b.id
  );

  // Pre-count how many games share each dateShort so we can build unique labels
  const dateCounts: Record<string, number> = {};
  const dateSeenCount: Record<string, number> = {};
  for (const g of sorted) {
    dateCounts[g.dateShort] = (dateCounts[g.dateShort] ?? 0) + 1;
  }

  let cumFor = 0;
  let cumAgainst = 0;
  const chartData = sorted.map((g) => {
    cumFor += g.runsFor;
    cumAgainst += g.runsAgainst;
    dateSeenCount[g.dateShort] = (dateSeenCount[g.dateShort] ?? 0) + 1;
    const count = dateSeenCount[g.dateShort];
    const name = dateCounts[g.dateShort] > 1 && count > 1
      ? `${g.dateShort} (${count})`
      : g.dateShort;
    return {
      name,
      opponent: g.opponent,
      date: g.dateShort,
      "Runs Scored": cumFor,
      "Runs Allowed": cumAgainst,
    };
  });

  return (
    <ChartCard title="Cumulative Runs" subtitle="Team runs scored vs runs allowed across the season">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ left: 0, right: 20, top: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
          <XAxis dataKey="name" tick={{ fill: GRAY, fontSize: 10 }} axisLine={false} />
          <YAxis tick={{ fill: GRAY, fontSize: 10 }} axisLine={false} />
          <Tooltip cursor={false} contentStyle={{ backgroundColor: BG, border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12 }} itemStyle={{ color: "#b0b0b0" }} labelStyle={{ color: "white", fontWeight: 600 }} />
          <Line type="monotone" dataKey="Runs Scored" stroke={PURPLE_LIGHT} strokeWidth={2.5} dot={{ fill: PURPLE_LIGHT, r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Runs Allowed" stroke={RED} strokeWidth={2} strokeDasharray="4 4" dot={{ fill: RED, r: 3 }} activeDot={{ r: 5 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: GRAY, paddingTop: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── 8. Earned Runs "What If" ────────────────────────────────────

export function EarnedRunsWhatIfChart({
  gameLog,
  boxScores,
}: {
  gameLog: GameResult[];
  boxScores: Record<number, GameBoxScore>;
}) {
  const sorted = [...gameLog].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id - b.id
  );

  const games = sorted.map((g) => {
    const box = boxScores[g.id];
    const earnedAgainst = box
      ? box.pitching.reduce((s, p) => s + p.er, 0)
      : g.runsAgainst;
    const unearned = g.runsAgainst - earnedAgainst;
    const wouldWin = g.runsFor > earnedAgainst;
    const wouldTie = g.runsFor === earnedAgainst;
    const wouldResult = wouldWin ? "W" : wouldTie ? "T" : "L";
    const flipped = g.result !== "W" && wouldWin;

    return {
      opponent: g.opponent,
      date: g.dateShort,
      runsFor: g.runsFor,
      runsAgainst: g.runsAgainst,
      earnedAgainst,
      unearned,
      actualResult: g.result,
      wouldResult,
      flipped,
    };
  });

  const flippedCount = games.filter((d) => d.flipped).length;

  return (
    <ChartCard
      title="What If: Earned Runs Only"
      subtitle={`If errors didn't score runs. ${flippedCount > 0 ? `${flippedCount} game${flippedCount > 1 ? "s" : ""} would have flipped to a win.` : "No games would have changed outcome."}`}
    >
      <div className="space-y-2">
        {games.map((g, i) => (
          <div
            key={i}
            className={`rounded-lg border px-4 py-3 ${
              g.flipped
                ? "border-green-700/40 bg-green-900/10"
                : "border-[#1e1e1e] bg-[#0d0d0d]"
            }`}
          >
            {/* Game header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[#6a6a6a] text-[11px]">{g.date}</span>
                <span className="text-white text-xs font-medium">vs {g.opponent}</span>
              </div>
              {g.flipped && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-900/30 text-green-400">
                  Flipped
                </span>
              )}
            </div>

            {/* Two-column score comparison */}
            <div className="grid grid-cols-2 gap-3">
              {/* Actual result */}
              <div className="rounded-md bg-[#111] border border-[#1a1a1a] px-3 py-2">
                <span className="text-[#5a5a5a] text-[9px] uppercase tracking-widest block mb-1">Actual</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    g.actualResult === "W" ? "bg-[#152a15] text-[#8ae88a]" : "bg-[#2a1515] text-[#e88a8a]"
                  }`}>
                    {g.actualResult}
                  </span>
                  <span className="text-white text-sm font-mono font-bold">{g.runsFor}</span>
                  <span className="text-[#3a3a3a] text-xs">–</span>
                  <span className="text-[#8a8a8a] text-sm font-mono font-bold">{g.runsAgainst}</span>
                </div>
              </div>

              {/* What-if result */}
              <div className={`rounded-md px-3 py-2 border ${
                g.flipped
                  ? "bg-green-900/10 border-green-800/30"
                  : "bg-[#111] border-[#1a1a1a]"
              }`}>
                <span className="text-[#5a5a5a] text-[9px] uppercase tracking-widest block mb-1">Without Errors</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    g.wouldResult === "W" ? "bg-[#152a15] text-[#8ae88a]"
                    : g.wouldResult === "T" ? "bg-[#2a2a15] text-[#e8e88a]"
                    : "bg-[#2a1515] text-[#e88a8a]"
                  }`}>
                    {g.wouldResult}
                  </span>
                  <span className="text-white text-sm font-mono font-bold">{g.runsFor}</span>
                  <span className="text-[#3a3a3a] text-xs">–</span>
                  <span className="text-[#8a8a8a] text-sm font-mono font-bold">{g.earnedAgainst}</span>
                  {g.unearned > 0 && (
                    <span className="text-[#e88a8a] text-[10px]">
                      ({g.unearned} unearned)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
