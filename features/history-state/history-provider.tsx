"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";

import { useHistoryStore } from "./history-store";
import { parseHistoryQuery, serializeHistoryQuery } from "./history-url";

export function HistoryProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  useEffect(() => {
    const parsed = parseHistoryQuery(searchParams);
    const state = useHistoryStore.getState();
    if (!initialized.current) {
      state.reset(parsed);
      initialized.current = true;
      return;
    }
    if (
      parsed.currentYear !== state.currentYear ||
      parsed.selectedDynasty !== state.selectedDynasty ||
      parsed.selectedPerson !== state.selectedPerson ||
      parsed.selectedEvent !== state.selectedEvent
    ) {
      state.reset({ ...parsed, isPlaying: false, aiDrawerOpen: state.aiDrawerOpen });
    }
  }, [searchParams]);

  useEffect(() => {
    return useHistoryStore.subscribe((state, previous) => {
      if (!initialized.current) return;
      const changed =
        state.currentYear !== previous.currentYear ||
        state.selectedDynasty !== previous.selectedDynasty ||
        state.selectedPerson !== previous.selectedPerson ||
        state.selectedEvent !== previous.selectedEvent;
      if (!changed) return;
      const query = serializeHistoryQuery(state);
      if (query !== searchParams.toString()) router.replace(`${pathname}?${query}`, { scroll: false });
    });
  }, [pathname, router, searchParams]);

  return children;
}
