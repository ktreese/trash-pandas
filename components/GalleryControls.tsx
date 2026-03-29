"use client";

import { List, Users, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import DatePicker from "./DatePicker";

interface GalleryControlsProps {
  viewMode: "chronological" | "grouped";
  onToggleView: () => void;
  authorFilter: string | null;
  authors: string[];
  onAuthorChange: (author: string | null) => void;
  dateFilter: Date | null;
  onDateChange: (date: Date | null) => void;
}

export default function GalleryControls({
  viewMode,
  onToggleView,
  authorFilter,
  authors,
  onAuthorChange,
  dateFilter,
  onDateChange,
}: GalleryControlsProps) {
  const isGrouped = viewMode === "grouped";

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* View toggle */}
      <button
        onClick={onToggleView}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isGrouped
            ? "bg-[#6B35A3] text-white shadow-[0_0_15px_rgba(107,53,163,0.3)]"
            : "bg-[#1a1a1a] text-[#b8b8b8] border border-[#2a2a2a] hover:border-[#6B35A3] hover:text-white"
        }`}
      >
        {isGrouped ? <Users size={14} /> : <List size={14} />}
        {isGrouped ? "By Author" : "All Photos"}
      </button>

      {/* Conditional filters */}
      <AnimatePresence>
        {isGrouped && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="flex flex-wrap items-center gap-2"
          >
            {/* Author dropdown */}
            <div className="relative">
              <select
                value={authorFilter ?? ""}
                onChange={(e) => onAuthorChange(e.target.value || null)}
                className="appearance-none rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-[#b8b8b8] pl-3 pr-8 py-2 hover:border-[#6B35A3] focus:border-[#6B35A3] focus:outline-none focus:ring-1 focus:ring-[#6B35A3] transition-colors cursor-pointer"
              >
                <option value="">All Authors</option>
                {authors.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a8a8a] pointer-events-none" />
            </div>

            {/* Date filter */}
            <DatePicker value={dateFilter} onChange={onDateChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
