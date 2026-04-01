import { NextResponse } from "next/server";
import { saveMediaMeta } from "@/lib/media";
import { verifyUploadSession } from "@/lib/auth";

/**
 * Called by the client after a successful direct-to-Blob upload
 * to persist the media metadata.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const cookie = request.headers.get("cookie") ?? "";
  const uploadToken = cookie.match(/(?:^|;\s*)upload_auth=([^;]+)/)?.[1];
  if (!uploadToken || !(await verifyUploadSession(uploadToken))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blob_url, blob_pathname, content_type, size, caption, uploader_name } =
      await request.json();

    if (!blob_url || !blob_pathname || !content_type) {
      return NextResponse.json({ error: "Missing required blob fields." }, { status: 400 });
    }

    const item = await saveMediaMeta({
      blob_url,
      blob_pathname,
      content_type,
      size: typeof size === "number" ? size : undefined,
      caption: caption || undefined,
      uploader_name: uploader_name || undefined,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("Save metadata error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
