"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Trash2, FileSpreadsheet, ChevronDown, ChevronUp } from "lucide-react";

interface GameSummary {
  id: number;
  date: string;
  opponent: string;
  runsFor: number;
  runsAgainst: number;
  result: string;
}

interface ManifestData {
  season: { uploadedAt: string; batting: unknown[] } | null;
  games: GameSummary[];
}

export default function AdminStatsManager({
  initialManifest,
}: {
  initialManifest: ManifestData | null;
}) {
  const [manifest, setManifest] = useState<ManifestData | null>(initialManifest);
  const [expanded, setExpanded] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Game form state
  const [gameDate, setGameDate] = useState("");
  const [gameOpponent, setGameOpponent] = useState("");

  const seasonFileRef = useRef<HTMLInputElement>(null);
  const gameFileRef = useRef<HTMLInputElement>(null);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
    setUploadPhase(null);
  };

  // Poll manifest until the expected game count appears (confirms blob propagation)
  const waitForManifestSync = async (expectedGameCount: number, maxAttempts = 6) => {
    setUploadPhase("Verifying save…");
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.games.length >= expectedGameCount) {
            setManifest(data);
            return true;
          }
        }
      } catch { /* retry */ }
    }
    return false;
  };

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });

  // ── Season CSV Upload ───────────────────────────────────────────
  const handleSeasonUpload = useCallback(async () => {
    clearMessages();
    const file = seasonFileRef.current?.files?.[0];
    if (!file) {
      setError("Select a season CSV file first.");
      return;
    }

    setUploading(true);
    try {
      setUploadPhase("Uploading CSV…");
      const csv = await readFileAsText(file);
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "season", csv }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const updated = await res.json();
      setManifest(updated);
      setUploadPhase(null);
      setSuccess(
        `Season stats uploaded — ${updated.season.batting.length} players`
      );
      if (seasonFileRef.current) seasonFileRef.current.value = "";
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      setUploadPhase(null);
    }
  }, []);

  // ── Game CSV Upload ─────────────────────────────────────────────
  const handleGameUpload = useCallback(async () => {
    clearMessages();
    const file = gameFileRef.current?.files?.[0];
    if (!file) {
      setError("Select a game CSV file first.");
      return;
    }
    if (!gameDate || !gameOpponent) {
      setError("Fill in date and opponent before uploading.");
      return;
    }

    setUploading(true);
    const opponent = gameOpponent;
    try {
      setUploadPhase("Uploading CSV…");
      const csv = await readFileAsText(file);
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "game",
          csv,
          date: gameDate,
          opponent: gameOpponent,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const updated = await res.json();
      setManifest(updated);

      // Reset form
      setGameDate("");
      setGameOpponent("");
      if (gameFileRef.current) gameFileRef.current.value = "";

      // Verify the game actually persisted to blob storage
      const expectedCount = updated.games.length;
      const synced = await waitForManifestSync(expectedCount);

      if (synced) {
        setSuccess(`Game vs ${opponent} saved and verified. Ready for next upload.`);
      } else {
        setSuccess(`Game vs ${opponent} uploaded — still syncing. Wait a few seconds before uploading the next game.`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      setUploadPhase(null);
    }
  }, [gameDate, gameOpponent]);

  // ── Delete Game ─────────────────────────────────────────────────
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);

  const handleDeleteGame = useCallback(async (gameId: number) => {
    clearMessages();
    setConfirmingDelete(null);

    try {
      const res = await fetch(`/api/admin/stats?gameId=${gameId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      const updated = await res.json();
      setManifest(updated);
      setSuccess("Game deleted.");
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  // ── Auto-fill from filename ─────────────────────────────────────
  const handleGameFileChange = () => {
    const file = gameFileRef.current?.files?.[0];
    if (!file) return;

    // Try to parse: 2026-03-29-vs-Eagles-game01.csv
    const match = file.name.match(
      /^(\d{4}-\d{2}-\d{2})-vs-(.+?)-game\d+\.csv$/i
    );
    if (match) {
      setGameDate(match[1]);
      setGameOpponent(match[2].replace(/-/g, " "));
    }
  };

  const inputClass =
    "w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a5a] focus:outline-none focus:border-[#6B35A3] transition-colors";

  return (
    <div className="mt-10 border-t border-[#2a2a2a] pt-8">
      {/* Section header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-4 group"
      >
        <FileSpreadsheet size={18} className="text-[#6B35A3]" />
        <h2 className="text-xl font-bold text-white">Stats Manager</h2>
        <span className="text-[#5a5a5a] text-xs ml-2">
          {manifest?.season ? "Season loaded" : "No season data"} ·{" "}
          {manifest?.games.length ?? 0} game(s)
        </span>
        {expanded ? (
          <ChevronUp size={16} className="text-[#5a5a5a] ml-auto" />
        ) : (
          <ChevronDown size={16} className="text-[#5a5a5a] ml-auto" />
        )}
      </button>

      {!expanded && <></>}
      {expanded && (
        <div className="space-y-6">
          {/* Messages */}
          {uploadPhase && (
            <div className="bg-purple-900/20 border border-purple-800/40 text-purple-300 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-purple-400 animate-pulse" />
              {uploadPhase}
            </div>
          )}
          {error && (
            <div className="bg-red-900/20 border border-red-800/40 text-red-300 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-900/20 border border-green-800/40 text-green-300 text-sm rounded-lg px-4 py-3">
              {success}
            </div>
          )}

          {/* Season Stats Upload */}
          <div className="bg-[#131313] border border-[#2a2a2a] rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-1">
              Season Stats CSV
            </h3>
            <p className="text-[#6a6a6a] text-xs mb-4">
              Upload the overall season stats CSV from GameChanger. This replaces
              any previously uploaded season data.
              {manifest?.season && (
                <span className="text-[#8a6aba] ml-1">
                  Last updated:{" "}
                  {new Date(manifest.season.uploadedAt).toLocaleDateString()}
                </span>
              )}
            </p>
            <div className="flex items-center gap-3">
              <input
                ref={seasonFileRef}
                type="file"
                accept=".csv"
                className="text-sm text-[#8a8a8a] file:mr-3 file:rounded-lg file:border-0 file:bg-[#6B35A3]/20 file:text-[#c4a0e8] file:px-3 file:py-1.5 file:text-xs file:font-medium file:cursor-pointer hover:file:bg-[#6B35A3]/30"
              />
              <button
                onClick={handleSeasonUpload}
                disabled={uploading}
                className="flex items-center gap-1.5 bg-[#6B35A3] hover:bg-[#7B45B3] disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Upload size={14} />
                {uploading ? "Uploading..." : "Upload Season"}
              </button>
            </div>
          </div>

          {/* Game CSV Upload */}
          <div className="bg-[#131313] border border-[#2a2a2a] rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-1">
              Game Box Score CSV
            </h3>
            <p className="text-[#6a6a6a] text-xs mb-4">
              Upload individual game CSVs. Date and opponent auto-fill from
              filename (e.g.{" "}
              <code className="text-[#8a6aba]">
                2026-03-29-vs-Eagles-game01.csv
              </code>
              ).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[#6a6a6a] text-[10px] uppercase tracking-wider block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={gameDate}
                  onChange={(e) => setGameDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[#6a6a6a] text-[10px] uppercase tracking-wider block mb-1">
                  Opponent
                </label>
                <input
                  type="text"
                  value={gameOpponent}
                  onChange={(e) => setGameOpponent(e.target.value)}
                  placeholder="e.g. Eagles"
                  className={inputClass}
                />
              </div>
            </div>
            <p className="text-[#5a5a5a] text-[11px] mb-4">
              Score, hits, and errors are auto-calculated from the CSV.
            </p>

            <div className="flex items-center gap-3">
              <input
                ref={gameFileRef}
                type="file"
                accept=".csv"
                onChange={handleGameFileChange}
                className="text-sm text-[#8a8a8a] file:mr-3 file:rounded-lg file:border-0 file:bg-[#6B35A3]/20 file:text-[#c4a0e8] file:px-3 file:py-1.5 file:text-xs file:font-medium file:cursor-pointer hover:file:bg-[#6B35A3]/30"
              />
              <button
                onClick={handleGameUpload}
                disabled={uploading}
                className="flex items-center gap-1.5 bg-[#6B35A3] hover:bg-[#7B45B3] disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Upload size={14} />
                {uploading ? "Uploading..." : "Upload Game"}
              </button>
            </div>
          </div>

          {/* Uploaded Games List */}
          {manifest && manifest.games.length > 0 && (
            <div className="bg-[#131313] border border-[#2a2a2a] rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">
                Uploaded Games ({manifest.games.length})
              </h3>
              <div className="space-y-2">
                {manifest.games
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime() ||
                      a.id - b.id
                  )
                  .map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg px-4 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            game.result === "W"
                              ? "bg-[#152a15] text-[#8ae88a]"
                              : "bg-[#2a1515] text-[#e88a8a]"
                          }`}
                        >
                          {game.result}
                        </span>
                        <span className="text-white text-sm font-medium">
                          vs {game.opponent}
                        </span>
                        <span className="text-[#6a6a6a] text-xs">
                          {game.date}
                        </span>
                        <span className="text-[#8a8a8a] text-xs font-mono">
                          {game.runsFor}–{game.runsAgainst}
                        </span>
                      </div>
                      {confirmingDelete === game.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteGame(game.id)}
                            className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmingDelete(null)}
                            className="text-[#5a5a5a] hover:text-white text-xs transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingDelete(game.id)}
                          className="text-[#5a5a5a] hover:text-red-400 transition-colors p-1"
                          title="Delete game"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
