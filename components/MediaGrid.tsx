"use client";

import Image from "next/image";
import { Play, ImageIcon, Download, Check } from "lucide-react";
import type { MediaItem } from "@/lib/types";

interface MediaCardProps {
  item: MediaItem;
  onClick: () => void;
  selectMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  isDownloaded: boolean;
  onSingleDownload: (e: React.MouseEvent) => void;
  priority?: boolean;
}

interface MediaGridProps {
  items: MediaItem[];
  onItemClick?: (index: number) => void;
  selectMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  downloadedIds: Set<string>;
  onSingleDownload: (item: MediaItem, e: React.MouseEvent) => void;
}

export function MediaCard({
  item,
  onClick,
  selectMode,
  isSelected,
  onToggleSelect,
  isDownloaded,
  onSingleDownload,
  priority = false,
}: MediaCardProps) {
  const isVideo = item.content_type.startsWith("video/");

  const handleClick = () => {
    if (selectMode) onToggleSelect();
    else onClick();
  };

  return (
    <div
      className={`masonry-item group relative cursor-pointer overflow-hidden rounded-xl bg-[#1a1a1a] border transition-all duration-200 ${
        isSelected
          ? "border-[#6B35A3] shadow-[0_0_20px_rgba(107,53,163,0.5)]"
          : "border-[#2a2a2a] hover:border-[#6B35A3] hover:shadow-[0_0_20px_rgba(107,53,163,0.3)]"
      }`}
      onClick={handleClick}
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
            priority={priority}
          />
        )}
      </div>

      {/* Selection overlay */}
      {selectMode && isSelected && (
        <div className="absolute inset-0 bg-[#6B35A3]/30 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-[#6B35A3] flex items-center justify-center shadow-lg">
            <Check size={16} className="text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Select mode checkbox indicator (unselected) */}
      {selectMode && !isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white/60 bg-black/40" />
      )}

      {/* Downloaded watermark (centered overlay, hidden in select mode) */}
      {isDownloaded && !selectMode && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/55 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <Check size={13} className="text-white/90" strokeWidth={2.5} />
            <span className="text-white/90 text-xs font-medium tracking-wide">Downloaded</span>
          </div>
        </div>
      )}

      {/* Hover download button (bottom-right, only outside select mode) */}
      {!selectMode && (
        <a
          href={`/api/download?url=${encodeURIComponent(item.blob_url)}&filename=${encodeURIComponent(item.blob_pathname.split("/").pop()?.replace(/^\d+-/, "") ?? "download")}`}
          onClick={(e) => { e.stopPropagation(); onSingleDownload(e); }}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/70 hover:bg-[#6B35A3] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
          aria-label="Download"
        >
          <Download size={14} className="text-white" />
        </a>
      )}

      {/* Hover overlay with info */}
      {(item.caption || item.uploader_name) && (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 pointer-events-none">
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

export default function MediaGrid({
  items,
  onItemClick,
  selectMode,
  selectedIds,
  onToggleSelect,
  downloadedIds,
  onSingleDownload,
}: MediaGridProps) {
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
    <div className="masonry-grid">
      {items.map((item, i) => (
        <MediaCard
          key={item.id}
          item={item}
          onClick={() => onItemClick?.(i)}
          selectMode={selectMode}
          isSelected={selectedIds.has(item.id)}
          onToggleSelect={() => onToggleSelect(item.id)}
          isDownloaded={downloadedIds.has(item.id)}
          onSingleDownload={(e) => onSingleDownload(item, e)}
          priority={i === 0}
        />
      ))}
    </div>
  );
}
