import { neon } from "@neondatabase/serverless";
import type { MediaItem } from "./types";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export async function getAllMedia(): Promise<MediaItem[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, blob_url, blob_pathname, content_type, caption, uploader_name, created_at, size
    FROM media
    ORDER BY created_at DESC
  `;
  return rows as MediaItem[];
}

export async function insertMedia(data: {
  blob_url: string;
  blob_pathname: string;
  content_type: string;
  caption?: string;
  uploader_name?: string;
  size?: number;
}): Promise<MediaItem> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO media (blob_url, blob_pathname, content_type, caption, uploader_name, size)
    VALUES (
      ${data.blob_url},
      ${data.blob_pathname},
      ${data.content_type},
      ${data.caption ?? null},
      ${data.uploader_name ?? null},
      ${data.size ?? null}
    )
    RETURNING *
  `;
  return rows[0] as MediaItem;
}

export async function deleteMedia(id: number): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM media WHERE id = ${id}`;
}
