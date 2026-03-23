import { NextResponse } from "next/server";
import { getAllMedia, insertMedia } from "@/lib/db";

export async function GET() {
  try {
    const items = await getAllMedia();
    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/media error:", err);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blob_url, blob_pathname, content_type, caption, uploader_name, size } = body;

    if (!blob_url || !blob_pathname || !content_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await insertMedia({
      blob_url,
      blob_pathname,
      content_type,
      caption,
      uploader_name,
      size,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("POST /api/media error:", err);
    return NextResponse.json({ error: "Failed to save media" }, { status: 500 });
  }
}
