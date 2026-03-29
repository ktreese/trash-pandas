"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { KeyRound, Loader2, ShieldAlert } from "lucide-react";

export default function TeamCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (res.ok) {
        router.refresh(); // Re-renders the upload page — now shows UploadForm
      } else {
        const data = await res.json();
        setError(data.error ?? "Incorrect code");
        setCode("");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm w-full px-4 sm:px-6 py-16 flex flex-col items-center">
      <div className="relative h-16 w-16 mb-6">
        <Image src="/logos/tp-icon.png" alt="Trash Pandas" fill className="object-contain" sizes="64px" />
      </div>

      <h1 className="text-2xl font-bold text-white text-center">Team Access</h1>
      <p className="text-[#8a8a8a] text-sm mt-2 text-center">
        Enter the team code shared in GameChanger to upload photos and videos.
      </p>

      <form onSubmit={handleSubmit} className="w-full mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#b8b8b8] mb-1.5">Team Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter team code…"
            required
            autoFocus
            className="w-full rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-white placeholder-[#555] focus:border-[#6B35A3] focus:outline-none focus:ring-1 focus:ring-[#6B35A3] transition-colors text-sm"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <ShieldAlert size={16} className="text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || code.trim().length === 0}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#6B35A3] hover:bg-[#8B45C8] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3 font-semibold text-white transition-all text-sm"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
          {loading ? "Checking…" : "Enter"}
        </button>

        <p className="text-[#555] text-xs text-center">
          You&apos;ll only need to enter this once on each device.
        </p>
      </form>
    </div>
  );
}
