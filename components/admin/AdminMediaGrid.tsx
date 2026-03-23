"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Play, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MediaItem } from "@/lib/types";

export default function AdminMediaGrid({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async (item: MediaItem) => {
    if (confirmId !== item.id) {
      setConfirmId(item.id);
      return;
    }

    setDeleting(item.id);
    setConfirmId(null);

    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, blobUrl: item.blob_url }),
      });

      if (!res.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  if (items.length === 0) {
    return (
      <p className="text-[#8a8a8a] text-center py-16">No photos or videos yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {items.map((item) => {
        const isVideo = item.content_type.startsWith("video/");
        const isDeleting = deleting === item.id;
        const needsConfirm = confirmId === item.id;

        return (
          <div
            key={item.id}
            className="group relative rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] aspect-square"
          >
            {/* Thumbnail */}
            {isVideo ? (
              <div className="w-full h-full flex items-center justify-center bg-[#111]">
                <Play size={24} className="text-[#6B35A3]" />
              </div>
            ) : (
              <Image
                src={item.blob_url}
                alt={item.caption ?? ""}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center gap-2">
              {/* Delete / Confirm button */}
              <button
                onClick={() => handleDelete(item)}
                disabled={isDeleting}
                className={`opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                  needsConfirm
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-black/70 hover:bg-red-600 text-white"
                }`}
              >
                {isDeleting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
                {isDeleting ? "Deleting…" : needsConfirm ? "Confirm delete" : "Delete"}
              </button>

              {needsConfirm && (
                <button
                  onClick={() => setConfirmId(null)}
                  className="opacity-0 group-hover:opacity-100 transition-all px-3 py-1.5 rounded-lg text-xs text-[#b8b8b8] hover:text-white bg-black/50"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Caption / meta */}
            {(item.caption || item.uploader_name) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                {item.caption && (
                  <p className="text-white text-[10px] font-medium truncate">{item.caption}</p>
                )}
                {item.uploader_name && (
                  <p className="text-[#c4a0e8] text-[10px] truncate">{item.uploader_name}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
