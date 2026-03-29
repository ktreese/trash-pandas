"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "tp_downloaded";

function loadFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function useDownloadHistory() {
  // Start with empty Set (matches server render), hydrate from localStorage after mount
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDownloadedIds(loadFromStorage());
  }, []);

  const markDownloaded = useCallback((ids: string[]) => {
    setDownloadedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // localStorage unavailable — silently ignore
      }
      return next;
    });
  }, []);

  const isDownloaded = useCallback(
    (id: string) => downloadedIds.has(id),
    [downloadedIds]
  );

  return { downloadedIds, isDownloaded, markDownloaded };
}
