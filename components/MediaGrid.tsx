"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Play, ImageIcon } from "lucide-react";
import Lightbox from "./Lightbox";
import type { MediaItem } from "@/lib/types";

interface MediaGridProps {
  items: MediaItem[];
}

function MediaCard({ item, onClick }: { item: MediaItem; onClick: () => void }) {
  const isVideo = item.content_type.startsWith("video/");

  return (
    <div
      className="masonry-item group relative cursor-pointer overflow-hidden rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#6B35A3] transition-all duration-200 hover:shadow-[0_0_20px_rgba(107,53,163,0.3)]"
      onClick={onClick}
    >
      <div className="relative w-full">
        {isVideo ? (
          <div className="relative aspect-video bg-[#111]">
            <video
              src={item.blob_url}
              className="w-full h-full object-cover"
              preload="metadata"
              muted
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#6B35A3] shadow-[0_0_20px_rgba(107,53,163,0.6)] group-hover:bg-[#8B45C8] transition-all group-hover:scale-110">
                <Play size={20} className="text-white ml-0.5" fill="white" />
              </div>
            </div>
          </div>
        ) : (
          <Image
            src={item.blob_url}
            alt={item.caption ?? "Team photo"}
            width={600}
            height={400}
            className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}
      </div>

      {/* Hover overlay with info */}
      {(item.caption || item.uploader_name) && (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3">
          {item.caption && (
            <p className="text-white text-xs font-medium line-clamp-2">{item.caption}</p>
          )}
          {item.uploader_name && (
            <p className="text-[#c4a0e8] text-xs mt-0.5">by {item.uploader_name}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function MediaGrid({ items }: MediaGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevItem = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i - 1 + items.length) % items.length : null)),
    [items.length]
  );
  const nextItem = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i + 1) % items.length : null)),
    [items.length]
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <ImageIcon size={48} className="text-[#2a2a2a] mb-4" />
        <p className="text-[#8a8a8a] text-lg font-medium">No photos yet</p>
        <p className="text-[#8a8a8a] text-sm mt-1">Be the first to share a moment from the field!</p>
      </div>
    );
  }

  return (
    <>
      <div className="masonry-grid">
        {items.map((item, i) => (
          <MediaCard key={item.id} item={item} onClick={() => openLightbox(i)} />
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={items}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevItem}
          onNext={nextItem}
        />
      )}
    </>
  );
}
