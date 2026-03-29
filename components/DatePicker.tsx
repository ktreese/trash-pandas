"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(value?.getMonth() ?? today.getMonth());
  const [displayYear, setDisplayYear] = useState(value?.getFullYear() ?? today.getFullYear());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const prevMonth = () => {
    if (displayMonth === 0) { setDisplayMonth(11); setDisplayYear((y) => y - 1); }
    else setDisplayMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (displayMonth === 11) { setDisplayMonth(0); setDisplayYear((y) => y + 1); }
    else setDisplayMonth((m) => m + 1);
  };

  const selectDay = (day: number) => {
    onChange(new Date(displayYear, displayMonth, day));
    setOpen(false);
  };

  const daysInMonth = getDaysInMonth(displayYear, displayMonth);
  const firstDay = getFirstDayOfWeek(displayYear, displayMonth);

  const label = value
    ? `After: ${MONTHS[value.getMonth()].slice(0, 3)} ${value.getDate()}, ${value.getFullYear()}`
    : "Filter by date";

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
            value
              ? "bg-[#6B35A3]/20 text-[#c4a0e8] border border-[#6B35A3]/40"
              : "bg-[#1a1a1a] text-[#b8b8b8] border border-[#2a2a2a] hover:border-[#6B35A3]"
          }`}
        >
          <Calendar size={14} />
          {label}
        </button>
        {value && (
          <button
            onClick={() => onChange(null)}
            className="p-1.5 rounded-lg text-[#8a8a8a] hover:text-white hover:bg-[#2a2a2a] transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-50 w-72 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] shadow-2xl p-4"
          >
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-[#b8b8b8] hover:text-white transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-white text-sm font-medium">
                {MONTHS[displayMonth]} {displayYear}
              </span>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-[#b8b8b8] hover:text-white transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[10px] font-medium text-[#8a8a8a] py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(displayYear, displayMonth, day);
                const isSelected = value && isSameDay(date, value);
                const isToday = isSameDay(date, today);

                return (
                  <button
                    key={day}
                    onClick={() => selectDay(day)}
                    className={`h-8 w-full rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-[#6B35A3] text-white"
                        : isToday
                          ? "text-white ring-1 ring-[#6B35A3] hover:bg-[#6B35A3]/30"
                          : "text-[#b8b8b8] hover:bg-[#2a2a2a] hover:text-white"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Clear button */}
            {value && (
              <button
                onClick={() => { onChange(null); setOpen(false); }}
                className="w-full mt-3 py-1.5 text-xs text-[#8a8a8a] hover:text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
              >
                Clear date
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
