import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { saveMediaMeta } from "@/lib/media";
import { verifyUploadSession } from "@/lib/auth";

// Edge runtime: no request body size limit — files stream straight to Vercel Blob.
export const runtime = "edge";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

export async function POST(request: Request): Promise<NextResponse> {
  // ── Verify upload session cookie ────────────────────────────────────────────
  const cookie = request.headers.get("cookie") ?? "";
  const uploadToken = cookie.match(/(?:^|;\s*)upload_auth=([^;]+)/)?.[1];
  if (!uploadToken || !(await verifyUploadSession(uploadToken))) {
    return NextResponse.json({ error: "Unauthorized — enter the team code first." }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "application/octet-stream";
    const filename = decodeURIComponent(request.headers.get("x-filename") ?? `upload-${Date.now()}`);
    const caption = decodeURIComponent(request.headers.get("x-caption") ?? "") || undefined;
    const uploaderName = decodeURIComponent(request.headers.get("x-uploader") ?? "") || undefined;
    const size = Number(request.headers.get("x-size")) || undefined;

    const baseType = contentType.split(";")[0].trim();
    if (!ALLOWED_TYPES.has(baseType)) {
      return NextResponse.json({ error: `File type ${baseType} is not allowed.` }, { status: 400 });
    }

    if (!request.body) {
      return NextResponse.json({ error: "No file body provided." }, { status: 400 });
    }

    const blob = await put(`uploads/${filename}`, request.body, {
      access: "public",
      contentType: baseType,
    });

    const item = await saveMediaMeta({
      blob_url: blob.url,
      blob_pathname: blob.pathname,
      content_type: baseType,
      size,
      caption,
      uploader_name: uploaderName,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
