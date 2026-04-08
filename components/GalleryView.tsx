"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Camera, FilterX, Download } from "lucide-react";
import MediaGrid from "./MediaGrid";
import AuthorSection from "./AuthorSection";
import GalleryControls from "./GalleryControls";
import SelectionBar from "./SelectionBar";
import Lightbox from "./Lightbox";
import { useDownloadHistory } from "@/hooks/useDownloadHistory";
import type { MediaItem } from "@/lib/types";

interface GalleryViewProps {
  items: MediaItem[];
}

export default function GalleryView({ items }: GalleryViewProps) {
  const [viewMode, setViewMode] = useState<"chronological" | "grouped">("chronological");
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Select mode
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);

  // Download history
  const { downloadedIds, markDownloaded } = useDownloadHistory();

  const uniqueAuthors = useMemo(() => {
    const names = new Set<string>();
    items.forEach((item) => names.add(item.uploader_name ?? "Unknown"));
    return Array.from(names).sort((a, b) =>
      a === "Unknown" ? 1 : b === "Unknown" ? -1 : a.localeCompare(b)
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (authorFilter) {
      result = result.filter((item) => (item.uploader_name ?? "Unknown") === authorFilter);
    }
    if (dateFilter) {
      result = result.filter((item) => new Date(item.created_at) >= dateFilter);
    }
    return result;
  }, [items, authorFilter, dateFilter]);

  const groupedItems = useMemo(() => {
    if (viewMode !== "grouped") return null;
    const groups = new Map<string, MediaItem[]>();
    filteredItems.forEach((item) => {
      const name = item.uploader_name ?? "Unknown";
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name)!.push(item);
    });
    return new Map(
      [...groups.entries()].sort(([a], [b]) =>
        a === "Unknown" ? 1 : b === "Unknown" ? -1 : a.localeCompare(b)
      )
    );
  }, [filteredItems, viewMode]);

  const toggleView = () => {
    setViewMode((m) => {
      if (m === "grouped") {
        setAuthorFilter(null);
        setDateFilter(null);
        return "chronological";
      }
      return "grouped";
    });
  };

  const clearFilters = () => {
    setAuthorFilter(null);
    setDateFilter(null);
  };

  // Lightbox
  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevItem = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i - 1 + filteredItems.length) % filteredItems.length : null)),
    [filteredItems.length]
  );
  const nextItem = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i + 1) % filteredItems.length : null)),
    [filteredItems.length]
  );

  // Selection
  const enterSelectMode = () => setSelectMode(true);
  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredItems.map((i) => i.id)));
  }, [filteredItems]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // Single download (native <a download> handles the file, we just mark history)
  const handleSingleDownload = useCallback(
    (item: MediaItem, e: React.MouseEvent) => {
      e.stopPropagation();
      markDownloaded([item.id]);
    },
    [markDownloaded]
  );

  // Bulk download
  const handleBulkDownload = useCallback(async () => {
    if (selectedIds.size === 0 || downloading) return;
    setDownloading(true);
    try {
      const selectedItems = filteredItems.filter((item) => selectedIds.has(item.id));
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedItems.map((item) => ({
            id: item.id,
            blob_url: item.blob_url,
            blob_pathname: item.blob_pathname,
          })),
        }),
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `trash-pandas-${date}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      markDownloaded([...selectedIds]);
      exitSelectMode();
    } catch (err) {
      console.error("[bulk download]", err);
    } finally {
      setDownloading(false);
    }
  }, [selectedIds, filteredItems, downloading, markDownloaded, exitSelectMode]);

  const hasActiveFilters = authorFilter !== null || dateFilter !== null;

  return (
    <>
      {/* Gallery header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Team Gallery</h2>
          <p className="text-[#8a8a8a] text-sm mt-0.5">
            {items.length > 0
              ? filteredItems.length === items.length
                ? `${items.length} photo${items.length === 1 ? "" : "s & videos"}`
                : `${filteredItems.length} of ${items.length} photo${items.length === 1 ? "" : "s & videos"}`
              : "Share the first one!"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 && !selectMode && (
            <button
              onClick={enterSelectMode}
              className="flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-[#b8b8b8] hover:border-[#6B35A3] hover:text-white transition-colors"
              title="Select photos to download"
            >
              <Download size={14} />
              Download
            </button>
          )}
          <Link
            href="/upload"
            className="flex items-center gap-1.5 text-sm text-[#c4a0e8] hover:text-white transition-colors"
          >
            <Camera size={15} />
            Upload
          </Link>
        </div>
      </div>

      {/* Controls (hidden in select mode) */}
      {items.length > 0 && !selectMode && (
        <GalleryControls
          viewMode={viewMode}
          onToggleView={toggleView}
          authorFilter={authorFilter}
          authors={uniqueAuthors}
          onAuthorChange={setAuthorFilter}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
        />
      )}

      {/* Grid */}
      {filteredItems.length === 0 && hasActiveFilters ? (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <FilterX size={48} className="text-[#2a2a2a] mb-4" />
          <p className="text-[#8a8a8a] text-lg font-medium">No photos match your filters</p>
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-[#c4a0e8] hover:text-white transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === "grouped" && groupedItems ? (
        (() => {
          let offset = 0;
          return [...groupedItems.entries()].map(([author, groupItems]) => {
            const section = (
              <AuthorSection
                key={author}
                authorName={author}
                items={groupItems}
                onItemClick={openLightbox}
                globalIndexOffset={offset}
                selectMode={selectMode}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                downloadedIds={downloadedIds}
                onSingleDownload={handleSingleDownload}
              />
            );
            offset += groupItems.length;
            return section;
          });
        })()
      ) : (
        <MediaGrid
          items={filteredItems}
          onItemClick={openLightbox}
          selectMode={selectMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          downloadedIds={downloadedIds}
          onSingleDownload={handleSingleDownload}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && !selectMode && (
        <Lightbox
          items={filteredItems}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevItem}
          onNext={nextItem}
        />
      )}

      {/* Selection bar */}
      {selectMode && (
        <SelectionBar
          selectedCount={selectedIds.size}
          totalCount={filteredItems.length}
          downloading={downloading}
          onDownload={handleBulkDownload}
          onSelectAll={selectAll}
          onClear={clearSelection}
          onCancel={exitSelectMode}
        />
      )}
    </>
  );
}
