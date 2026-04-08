"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import type { MediaItem } from "@/lib/types";

interface LightboxProps {
  items: MediaItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ items, index, onClose, onPrev, onNext }: LightboxProps) {
  const item = items[index];

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  if (!item) return null;

  const isVideo = item.content_type.startsWith("video/");

  // Derive a clean filename from the stored pathname (strips timestamp prefix)
  const rawFilename = item.blob_pathname.split("/").pop() ?? "download";
  const cleanFilename = rawFilename.replace(/^\d+-/, "");
  const downloadHref = `/api/download?url=${encodeURIComponent(item.blob_url)}&filename=${encodeURIComponent(cleanFilename)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fade-in"
      onClick={onClose}
    >
      {/* Controls bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex-1 min-w-0">
          {item.caption && (
            <p className="text-white text-sm font-medium truncate">{item.caption}</p>
          )}
          {item.uploader_name && (
            <p className="text-[#8a8a8a] text-xs truncate">by {item.uploader_name}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <a
            href={downloadHref}
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg text-[#b8b8b8] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Download"
          >
            <Download size={18} />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#b8b8b8] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Media */}
      <div
        className="relative w-full h-full flex items-center justify-center p-12 sm:p-16"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            src={item.blob_url}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-full rounded-lg"
            style={{ maxHeight: "calc(100vh - 8rem)" }}
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={item.blob_url}
              alt={item.caption ?? "Team photo"}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        )}
      </div>

      {/* Prev / Next */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#6B35A3] text-white transition-all"
            aria-label="Previous"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#6B35A3] text-white transition-all"
            aria-label="Next"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#8a8a8a] text-xs">
        {index + 1} / {items.length}
      </div>
    </div>
  );
}
