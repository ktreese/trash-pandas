import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import {
  getStatsManifest,
  uploadSeasonCsv,
  uploadGameCsv,
  deleteGame,
} from "@/lib/stats-store";

// ── Auth helper ───────────────────────────────────────────────────
async function requireAdmin(request: Request): Promise<NextResponse | null> {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/)?.[1];
  if (!token || !(await verifyAdminSession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// ── GET: Return current manifest ──────────────────────────────────
export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const manifest = await getStatsManifest();
  return NextResponse.json(manifest);
}

// ── POST: Upload a CSV ────────────────────────────────────────────
export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { type, csv } = body as { type: string; csv: string };

    if (!csv || typeof csv !== "string") {
      return NextResponse.json({ error: "Missing csv field" }, { status: 400 });
    }

    if (type === "season") {
      const manifest = await uploadSeasonCsv(csv);
      return NextResponse.json(manifest, { status: 201 });
    }

    if (type === "game") {
      const { date, opponent } = body as {
        date: string;
        opponent: string;
      };
      if (!date || !opponent) {
        return NextResponse.json(
          { error: "Game uploads require date and opponent" },
          { status: 400 }
        );
      }
      const manifest = await uploadGameCsv(csv, { date, opponent });
      return NextResponse.json(manifest, { status: 201 });
    }

    return NextResponse.json({ error: "type must be 'season' or 'game'" }, { status: 400 });
  } catch (err) {
    console.error("Stats upload error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// ── DELETE: Remove a game ─────────────────────────────────────────
export async function DELETE(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const gameId = parseInt(searchParams.get("gameId") ?? "", 10);
    if (isNaN(gameId)) {
      return NextResponse.json({ error: "gameId required" }, { status: 400 });
    }
    const manifest = await deleteGame(gameId);
    return NextResponse.json(manifest);
  } catch (err) {
    console.error("Stats delete error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
