import { list, put, del } from "@vercel/blob";
import type { MediaItem } from "./types";

const META_PREFIX = "meta/";

export async function getAllMedia(): Promise<MediaItem[]> {
  const { blobs } = await list({ prefix: META_PREFIX });

  if (blobs.length === 0) return [];

  const items = await Promise.all(
    blobs.map((blob) =>
      fetch(blob.url, { next: { revalidate: 0 } }).then((r) => r.json() as Promise<MediaItem>)
    )
  );

  return items.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function saveMediaMeta(data: {
  blob_url: string;
  blob_pathname: string;
  content_type: string;
  caption?: string;
  uploader_name?: string;
  size?: number;
}): Promise<MediaItem> {
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();

  const item: MediaItem = {
    id,
    blob_url: data.blob_url,
    blob_pathname: data.blob_pathname,
    content_type: data.content_type,
    caption: data.caption ?? null,
    uploader_name: data.uploader_name ?? null,
    size: data.size ?? null,
    created_at,
  };

  await put(`${META_PREFIX}${id}.json`, JSON.stringify(item), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });

  return item;
}

export async function deleteMedia(metaUrl: string, mediaBlobUrl: string): Promise<void> {
  await Promise.all([del(metaUrl), del(mediaBlobUrl)]);
}
