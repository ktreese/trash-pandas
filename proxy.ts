import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function adminSecret() {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) return null;
  return new TextEncoder().encode(s);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Protect admin dashboard and admin API routes ──────────────────────────
  if (pathname.startsWith("/admin/dashboard") || pathname.startsWith("/api/admin/media")) {
    const token = request.cookies.get("admin_session")?.value;
    const secret = adminSecret();

    if (!token || !secret) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin?reason=session_expired", request.url));
    }

    try {
      await jwtVerify(token, secret);
    } catch {
      const res = pathname.startsWith("/api/")
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        : NextResponse.redirect(new URL("/admin?reason=session_expired", request.url));
      res.cookies.delete("admin_session");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/api/admin/media/:path*"],
};

// Next.js 16+ proxy alias
export default proxy;
