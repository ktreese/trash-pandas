"use client";

import { Download, X, CheckSquare, Square } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SelectionBarProps {
  selectedCount: number;
  totalCount: number;
  downloading: boolean;
  onDownload: () => void;
  onSelectAll: () => void;
  onClear: () => void;
  onCancel: () => void;
}

export default function SelectionBar({
  selectedCount,
  totalCount,
  downloading,
  onDownload,
  onSelectAll,
  onClear,
  onCancel,
}: SelectionBarProps) {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <AnimatePresence>
      {selectedCount >= 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#2a2a2a] bg-[#0d0d0d]/90 backdrop-blur-md"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Left: count + select all / clear */}
            <div className="flex items-center gap-3">
              <span className="text-white text-sm font-medium">
                {selectedCount} {selectedCount === 1 ? "file" : "files"} selected
              </span>
              <div className="h-4 w-px bg-[#3a3a3a]" />
              <button
                onClick={allSelected ? onClear : onSelectAll}
                className="flex items-center gap-1.5 text-sm text-[#c4a0e8] hover:text-white transition-colors"
              >
                {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                {allSelected ? "Deselect All" : "Select All"}
              </button>
              {selectedCount > 0 && (
                <button
                  onClick={onClear}
                  className="text-sm text-[#8a8a8a] hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Right: download + cancel */}
            <div className="flex items-center gap-3">
              <button
                onClick={onDownload}
                disabled={selectedCount === 0 || downloading}
                className="flex items-center gap-2 rounded-lg bg-[#6B35A3] hover:bg-[#8B45C8] disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold text-white transition-all shadow-[0_0_15px_rgba(107,53,163,0.4)]"
              >
                <Download size={15} />
                {downloading ? "Zipping…" : `Download ${selectedCount > 0 ? selectedCount : ""} as ZIP`}
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-1.5 text-sm text-[#8a8a8a] hover:text-white transition-colors"
              >
                <X size={15} />
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
