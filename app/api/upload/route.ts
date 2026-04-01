import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { verifyUploadSession } from "@/lib/auth";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

/**
 * Client-upload token endpoint.
 * The browser calls this to get a short-lived token, then uploads directly
 * to Vercel Blob — bypassing Vercel's 4.5 MB function body-size limit.
 */
export async function POST(request: Request): Promise<NextResponse> {
  // ── Verify upload session cookie ────────────────────────────────────────────
  const cookie = request.headers.get("cookie") ?? "";
  const uploadToken = cookie.match(/(?:^|;\s*)upload_auth=([^;]+)/)?.[1];
  if (!uploadToken || !(await verifyUploadSession(uploadToken))) {
    return NextResponse.json({ error: "Unauthorized — enter the team code first." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_TYPES,
        maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB
      }),
      onUploadCompleted: async () => {
        // Metadata is saved by the client via /api/upload/complete after upload.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error("Upload token error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
