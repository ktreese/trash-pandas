"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Lock, Loader2, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("reason") === "session_expired";

  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, totpCode }),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await res.json();
        setError(data.error ?? "Login failed");
        setTotpCode("");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="relative h-16 w-16">
            <Image src="/logos/tp-icon.png" alt="Trash Pandas" fill className="object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Admin Login</h1>
            <p className="text-[#8a8a8a] text-sm mt-1">Trash Pandas 14U</p>
          </div>
        </div>

        {/* Session expired notice */}
        {sessionExpired && (
          <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 mb-6">
            <ShieldAlert size={16} className="text-yellow-400 shrink-0" />
            <p className="text-yellow-300 text-sm">Session expired — please log in again.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#b8b8b8] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 pr-11 text-white placeholder-[#555] focus:border-[#6B35A3] focus:outline-none focus:ring-1 focus:ring-[#6B35A3] transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#8a8a8a]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* TOTP */}
          <div>
            <label className="block text-sm font-medium text-[#b8b8b8] mb-1.5">
              Authenticator Code
              <span className="text-[#8a8a8a] font-normal ml-1">(Duo / Google Auth)</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              required
              autoComplete="one-time-code"
              className="w-full rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-white placeholder-[#555] focus:border-[#6B35A3] focus:outline-none focus:ring-1 focus:ring-[#6B35A3] transition-colors text-sm tracking-widest font-mono"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || password.length === 0 || totpCode.length !== 6}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#6B35A3] hover:bg-[#8B45C8] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3 font-semibold text-white transition-all text-sm"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            {loading ? "Verifying…" : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
