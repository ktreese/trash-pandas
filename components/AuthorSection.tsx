"use client";

import { MediaCard } from "./MediaGrid";
import type { MediaItem } from "@/lib/types";

interface AuthorSectionProps {
  authorName: string;
  items: MediaItem[];
  onItemClick: (globalIndex: number) => void;
  globalIndexOffset: number;
  selectMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  downloadedIds: Set<string>;
  onSingleDownload: (item: MediaItem, e: React.MouseEvent) => void;
}

export default function AuthorSection({
  authorName,
  items,
  onItemClick,
  globalIndexOffset,
  selectMode,
  selectedIds,
  onToggleSelect,
  downloadedIds,
  onSingleDownload,
}: AuthorSectionProps) {
  return (
    <div className="mb-8">
      <div className="border-l-2 border-[#6B35A3] pl-3 mb-4">
        <h3 className="text-lg font-semibold text-white">
          {authorName}
          <span className="text-[#8a8a8a] text-sm font-normal ml-2">
            {items.length} {items.length === 1 ? "photo" : "photos"}
          </span>
        </h3>
      </div>
      <div className="masonry-grid">
        {items.map((item, i) => (
          <MediaCard
            key={item.id}
            item={item}
            onClick={() => onItemClick(globalIndexOffset + i)}
            selectMode={selectMode}
            isSelected={selectedIds.has(item.id)}
            onToggleSelect={() => onToggleSelect(item.id)}
            isDownloaded={downloadedIds.has(item.id)}
            onSingleDownload={(e) => onSingleDownload(item, e)}
          />
        ))}
      </div>
    </div>
  );
}
