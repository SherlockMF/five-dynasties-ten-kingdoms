"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { MAX_YEAR, MIN_YEAR, useHistoryStore } from "@/features/history-state/history-store";
import { Button } from "@/components/ui/button";

export function MobileYearStepper() {
  const currentYear = useHistoryStore((state) => state.currentYear);
  const setCurrentYear = useHistoryStore((state) => state.setCurrentYear);
  const years = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, index) => MIN_YEAR + index);
  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
      <Button variant="outline" size="icon" aria-label="上一年" disabled={currentYear <= MIN_YEAR} onClick={() => setCurrentYear(currentYear - 1)}>
        <ChevronLeft aria-hidden="true" className="size-4" />
      </Button>
      <label className="min-w-32 flex-1">
        <span className="sr-only">直接选择年份</span>
        <select
          aria-label="直接选择年份"
          value={currentYear}
          onChange={(event) => setCurrentYear(Number(event.target.value))}
          className="h-10 w-full appearance-none rounded-full border border-ink/20 bg-paper px-5 text-center font-serif text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar"
        >
          {years.map((year) => <option key={year} value={year}>{year} 年</option>)}
        </select>
      </label>
      <Button variant="outline" size="icon" aria-label="下一年" disabled={currentYear >= MAX_YEAR} onClick={() => setCurrentYear(currentYear + 1)}>
        <ChevronRight aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
}
