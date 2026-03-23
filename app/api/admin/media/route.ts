import { NextResponse } from "next/server";
import { deleteMediaItem } from "@/lib/media";

// Auth is enforced by middleware — this route only runs for valid admin sessions
export const runtime = "edge";

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const { id, blobUrl } = await request.json();

    if (!id || !blobUrl) {
      return NextResponse.json({ error: "Missing id or blobUrl" }, { status: 400 });
    }

    await deleteMediaItem(id, blobUrl);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
