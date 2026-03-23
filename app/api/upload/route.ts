import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

// This route handles the signed token exchange for direct client-to-blob uploads.
// Large files (photos, videos) are uploaded straight to Vercel Blob from the browser,
// bypassing the serverless function body limit entirely.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate file extension / type here if needed
        const ext = pathname.split(".").pop()?.toLowerCase() ?? "";
        const allowed = ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "webm", "m4v"];
        if (!allowed.includes(ext)) {
          throw new Error(`File type .${ext} is not allowed.`);
        }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "video/mp4",
            "video/quicktime",
            "video/webm",
          ],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Called after successful upload — optional hook
        console.log("Blob uploaded:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
