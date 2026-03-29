import JSZip from "jszip";

export const runtime = "nodejs";

interface DownloadItem {
  id: string;
  blob_url: string;
  blob_pathname: string;
}

function getFilename(pathname: string, index: number): string {
  // blob_pathname is like "uploads/1234567890-photo.jpg"
  const base = pathname.split("/").pop() ?? `file-${index}`;
  // Strip the leading timestamp prefix (digits + dash)
  return base.replace(/^\d+-/, "");
}

function getDateString(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export async function POST(req: Request) {
  let items: DownloadItem[];
  try {
    const body = await req.json();
    items = body.items;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return new Response(JSON.stringify({ error: "No items provided" }), { status: 400 });
  }

  try {
    const zip = new JSZip();

    const fetched = await Promise.all(
      items.map(async (item, i) => {
        const res = await fetch(item.blob_url);
        if (!res.ok) throw new Error(`Failed to fetch ${item.blob_url}`);
        const buffer = await res.arrayBuffer();
        return { buffer, filename: getFilename(item.blob_pathname, i) };
      })
    );

    // Deduplicate filenames
    const seen = new Map<string, number>();
    for (const { buffer, filename } of fetched) {
      const count = seen.get(filename) ?? 0;
      seen.set(filename, count + 1);
      const name = count === 0 ? filename : `${filename.replace(/(\.\w+)$/, "")}-${count}$1`;
      zip.file(name, buffer);
    }

    const zipBuffer = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
    const zipFilename = `trash-pandas-${getDateString()}.zip`;

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Content-Length": String(zipBuffer.byteLength),
      },
    });
  } catch (err) {
    console.error("[download] zip error:", err);
    return new Response(JSON.stringify({ error: "Failed to build zip" }), { status: 500 });
  }
}
