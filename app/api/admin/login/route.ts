import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verify as totpVerify } from "otplib";
import { signAdminSession } from "@/lib/auth";
import { checkRateLimit, clearRateLimit } from "@/lib/rate-limit";

// Node.js runtime required for bcryptjs and otplib
export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    const retryAfterSecs = Math.ceil((limit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(retryAfterSecs / 60)} minutes.` },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSecs) },
      }
    );
  }

  // ── Validate env vars ──────────────────────────────────────────────────────
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const totpSecret = process.env.ADMIN_TOTP_SECRET;

  if (!passwordHash || !totpSecret) {
    console.error("Admin credentials not configured");
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let password: string, totpCode: string;
  try {
    const body = await request.json();
    password = String(body.password ?? "");
    totpCode = String(body.totpCode ?? "").replace(/\s/g, "");
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // ── Verify password ────────────────────────────────────────────────────────
  const passwordOk = await bcrypt.compare(password, passwordHash);

  // ── Verify TOTP (window: 1 allows ±30s clock skew) ──────────────────────────
  const totpOk = await totpVerify({ token: totpCode, secret: totpSecret });

  // Deliberate single failure path — don't reveal which factor failed
  if (!passwordOk || !totpOk) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // ── Success — issue session cookie ─────────────────────────────────────────
  clearRateLimit(ip);
  const sessionToken = await signAdminSession();

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 4, // 4 hours
    path: "/",
  });

  return response;
}
