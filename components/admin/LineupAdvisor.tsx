"use client";

import { useState, useEffect, useMemo } from "react";
import { Users, ChevronUp, ChevronDown, ChevronUpDown } from "lucide-react";
import type { BattingStats } from "@/lib/stats";

const MIN_PA = 5;

type SortKey = "obp" | "ops" | "qabPct" | "psPa" | "sb" | "kl";
type SortDir = "asc" | "desc";

// Composite score that approximates "batting order value":
// OBP is king (top-of-order), OPS rewards run production, QAB%/PS/PA reward
// plate discipline, SB rewards baserunning speed.
function lineupScore(p: BattingStats): number {
  return (
    (parseFloat(p.obp) || 0) * 40 +
    (parseFloat(p.ops) || 0) * 20 +
    (parseFloat(p.qabPct) / 100 || 0) * 15 +
    (p.pa > 0 ? p.sb / p.pa : 0) * 100 +
    (parseFloat(p.psPa ?? "0") || 0) * 3
  );
}

function fmt(val: string | number | undefined, decimals = 3): string {
  if (val === undefined || val === null || val === "") return "—";
  const n = parseFloat(String(val));
  return isNaN(n) ? "—" : n.toFixed(decimals);
}

function spotLabel(i: number): { label: string; color: string } {
  if (i < 2) return { label: "Top", color: "bg-[#6B35A3]/30 text-[#c4a0e8]" };
  if (i < 5) return { label: "Middle", color: "bg-[#153a15]/60 text-[#8ae88a]" };
  return { label: "Bottom", color: "bg-[#2a2a2a] text-[#8a8a8a]" };
}

const COLUMNS: { key: SortKey; label: string; tip: string }[] = [
  { key: "obp",    label: "OBP",    tip: "On-base percentage — top metric for leadoff spots" },
  { key: "ops",    label: "OPS",    tip: "On-base + slugging — best indicator of middle-order value" },
  { key: "qabPct", label: "QAB%",   tip: "Quality At-Bat % — plate discipline and approach" },
  { key: "psPa",   label: "PS/PA",  tip: "Pitches seen per plate appearance — tires opposing pitchers" },
  { key: "sb",     label: "SB",     tip: "Stolen bases — baserunning speed; important for top of order" },
  { key: "kl",     label: "K-L",    tip: "Strikeouts looking — batter caught not swinging; lower is better" },
];

export default function LineupAdvisor() {
  const [batting, setBatting] = useState<BattingStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("obp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setBatting(data.batting ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const qualified = useMemo(
    () => batting.filter((p) => p.pa >= MIN_PA),
    [batting]
  );

  const suggested = useMemo(
    () => [...qualified].sort((a, b) => lineupScore(b) - lineupScore(a)),
    [qualified]
  );

  const colValue = (p: BattingStats, key: SortKey): number => {
    switch (key) {
      case "obp":    return parseFloat(p.obp) || 0;
      case "ops":    return parseFloat(p.ops) || 0;
      case "qabPct": return parseFloat(p.qabPct) || 0;
      case "psPa":   return parseFloat(p.psPa ?? "0") || 0;
      case "sb":     return p.sb;
      case "kl":     return p.kl ?? 0;
    }
  };

  const sorted = useMemo(() => {
    return [...qualified].sort((a, b) => {
      const diff = colValue(a, sortKey) - colValue(b, sortKey);
      return sortDir === "desc" ? -diff : diff;
    });
  }, [qualified, sortKey, sortDir]);

  const leaders = useMemo(() => {
    const result: Partial<Record<SortKey, number>> = {};
    for (const col of COLUMNS) {
      result[col.key] = Math.max(...qualified.map((p) => colValue(p, col.key)));
    }
    return result;
  }, [qualified]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir(key === "kl" ? "asc" : "desc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUpDown size={11} className="text-[#3a3a3a]" />;
    return sortDir === "desc"
      ? <ChevronDown size={11} className="text-[#c4a0e8]" />
      : <ChevronUp size={11} className="text-[#c4a0e8]" />;
  };

  return (
    <div className="mt-10 border-t border-[#2a2a2a] pt-8">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-2 mb-4 group w-full text-left"
      >
        <Users size={18} className="text-[#6B35A3]" />
        <h2 className="text-xl font-bold text-white">Lineup Advisor</h2>
        <span className="text-[10px] font-medium bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded-full ml-1">
          Experimental
        </span>
        <span className="text-[#5a5a5a] text-xs ml-2">
          {qualified.length} player{qualified.length !== 1 ? "s" : ""} (min {MIN_PA} PA)
        </span>
        {expanded
          ? <ChevronUp size={16} className="text-[#5a5a5a] ml-auto" />
          : <ChevronDown size={16} className="text-[#5a5a5a] ml-auto" />}
      </button>

      {expanded && (
        <div className="space-y-6">
          {loading && (
            <p className="text-[#5a5a5a] text-sm">Loading stats…</p>
          )}

          {!loading && qualified.length === 0 && (
            <p className="text-[#5a5a5a] text-sm">
              No players with {MIN_PA}+ PA yet. Upload a season CSV to populate stats.
            </p>
          )}

          {!loading && qualified.length > 0 && (
            <>
              {/* Suggested order */}
              <div className="bg-[#131313] border border-[#2a2a2a] rounded-xl p-5">
                <h3 className="text-white font-semibold text-sm mb-1">Suggested Batting Order</h3>
                <p className="text-[#5a5a5a] text-xs mb-4">
                  Ranked by composite score: OBP (40%) + OPS (20%) + QAB% (15%) + SB rate (10%) + PS/PA (15%).
                  Use as a starting point — context and matchups always override the numbers.
                </p>
                <div className="space-y-1.5">
                  {suggested.map((p, i) => {
                    const { label, color } = spotLabel(i);
                    return (
                      <div
                        key={p.number}
                        className="flex items-center gap-3 bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg px-4 py-2"
                      >
                        <span className="text-[#5a5a5a] text-xs font-mono w-4 shrink-0">{i + 1}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${color}`}>
                          {label}
                        </span>
                        <span className="text-white text-sm font-medium flex-1">{p.name}</span>
                        <span className="text-[#6a6a6a] text-xs font-mono">
                          OBP {fmt(p.obp)} · OPS {fmt(p.ops)} · QAB {fmt(p.qabPct, 1)}%
                        </span>
                        {p.sb > 0 && (
                          <span className="text-[#8ae88a] text-[10px] font-medium ml-1">{p.sb} SB</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sortable reference table */}
              <div className="bg-[#131313] border border-[#2a2a2a] rounded-xl p-5">
                <h3 className="text-white font-semibold text-sm mb-1">Metric Explorer</h3>
                <p className="text-[#5a5a5a] text-xs mb-4">
                  Click any column to sort. Hover headers for definitions. Purple = leader.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#2a2a2a]">
                        <th className="py-2 px-3 text-left text-[10px] font-semibold text-[#5a5a5a] uppercase tracking-wider w-8">#</th>
                        <th className="py-2 px-3 text-left text-[10px] font-semibold text-[#5a5a5a] uppercase tracking-wider">Player</th>
                        <th className="py-2 px-2 text-right text-[10px] font-semibold text-[#5a5a5a] uppercase tracking-wider">PA</th>
                        {COLUMNS.map((col) => (
                          <th
                            key={col.key}
                            className="py-2 px-2 text-right text-[10px] font-semibold text-[#5a5a5a] uppercase tracking-wider cursor-pointer hover:text-[#c4a0e8] transition-colors group/col relative"
                            onClick={() => handleSort(col.key)}
                          >
                            <span className="inline-flex items-center justify-end gap-1">
                              {col.label}
                              <SortIcon col={col.key} />
                            </span>
                            <span className="invisible group-hover/col:visible absolute bottom-full right-0 mb-2 w-48 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[10px] text-[#b0b0b0] shadow-xl z-10 leading-relaxed text-left font-normal normal-case tracking-normal whitespace-normal">
                              {col.tip}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((p, ri) => (
                        <tr
                          key={p.number}
                          className={`border-b border-[#1a1a1a] ${ri % 2 === 0 ? "bg-[#0d0d0d]" : "bg-[#111]"}`}
                        >
                          <td className="py-2 px-3 text-[#5a5a5a] text-xs">{p.number}</td>
                          <td className="py-2 px-3 text-white text-xs font-medium">{p.name}</td>
                          <td className="py-2 px-2 text-right text-[#6a6a6a] text-xs">{p.pa}</td>
                          {COLUMNS.map((col) => {
                            const v = colValue(p, col.key);
                            const isLeader = v === leaders[col.key] && v > 0;
                            const raw = col.key === "sb" || col.key === "kl"
                              ? String(v)
                              : col.key === "qabPct"
                              ? `${fmt(v, 1)}%`
                              : fmt(v, 3);
                            return (
                              <td
                                key={col.key}
                                className={`py-2 px-2 text-right text-xs font-mono ${
                                  isLeader ? "text-[#c4a0e8] font-semibold" : "text-[#8a8a8a]"
                                }`}
                              >
                                {raw}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Spot guide */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-[#131313] border border-[#2a2a2a] rounded-xl p-4">
                  <span className="block text-[#c4a0e8] font-semibold mb-1">Top of Order (1–2)</span>
                  <span className="text-[#5a5a5a]">Prioritize: OBP, PS/PA, SB. These batters set the table — getting on base is everything.</span>
                </div>
                <div className="bg-[#131313] border border-[#2a2a2a] rounded-xl p-4">
                  <span className="block text-[#8ae88a] font-semibold mb-1">Middle Order (3–5)</span>
                  <span className="text-[#5a5a5a]">Prioritize: OPS, RBI, QAB%. These batters drive runners home — power and clutch hitting matter most.</span>
                </div>
                <div className="bg-[#131313] border border-[#2a2a2a] rounded-xl p-4">
                  <span className="block text-[#8a8a8a] font-semibold mb-1">Bottom of Order (6–9)</span>
                  <span className="text-[#5a5a5a]">Prioritize: QAB%, AVG, SB. Minimize outs and keep the lineup turning over to your top hitters.</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
