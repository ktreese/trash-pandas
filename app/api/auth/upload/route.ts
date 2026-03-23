import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { signUploadSession } from "@/lib/auth";

// Node.js runtime for timingSafeEqual
export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const teamCode = process.env.TEAM_UPLOAD_CODE;
  if (!teamCode) {
    return NextResponse.json({ error: "Upload code not configured" }, { status: 500 });
  }

  let submittedCode: string;
  try {
    const body = await request.json();
    submittedCode = String(body.code ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Timing-safe comparison — prevents timing attacks
  const a = Buffer.from(submittedCode);
  const b = Buffer.from(teamCode);
  const match = a.length === b.length && timingSafeEqual(a, b);

  if (!match) {
    // Small artificial delay on failure to slow brute force
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: "Incorrect team code" }, { status: 401 });
  }

  const token = await signUploadSession();

  const response = NextResponse.json({ ok: true });
  response.cookies.set("upload_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 90, // 90 days
    path: "/",
  });

  return response;
}
