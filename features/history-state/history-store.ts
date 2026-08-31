"use client";

import { create } from "zustand";

import {
  clampYear,
  DEFAULT_YEAR,
  MAX_YEAR,
} from "@/lib/history/year-range";

export {
  clampMapYear,
  clampYear,
  DEFAULT_YEAR,
  getHistoricalPeriod,
  MAP_MIN_YEAR,
  MAX_YEAR,
  MIN_YEAR,
  TIMELINE_MIN_YEAR,
} from "@/lib/history/year-range";

export interface HistoryCoreState {
  currentYear: number;
  selectedDynasty?: string;
  selectedPerson?: string;
  selectedEvent?: string;
  isPlaying: boolean;
  aiDrawerOpen: boolean;
}

interface HistoryActions {
  setCurrentYear: (year: number, isDynastyActive?: (id: string, year: number) => boolean) => void;
  selectDynasty: (id?: string) => void;
  selectPerson: (id?: string) => void;
  selectEvent: (id?: string) => void;
  play: () => void;
  pause: () => void;
  setAiDrawerOpen: (open: boolean) => void;
  reset: (state?: Partial<HistoryCoreState>) => void;
}

export type HistoryState = HistoryCoreState & HistoryActions;

type HistoryAction = { type: "setYear"; year: number };

const initialState: HistoryCoreState = {
  currentYear: DEFAULT_YEAR,
  isPlaying: false,
  aiDrawerOpen: false,
};

export function reduceHistoryState(
  state: Pick<HistoryCoreState, "currentYear" | "selectedDynasty">,
  action: HistoryAction,
  dependencies: { isDynastyActive: (id: string, year: number) => boolean },
) {
  const currentYear = clampYear(action.year);
  return {
    ...state,
    currentYear,
    selectedDynasty:
      state.selectedDynasty &&
      dependencies.isDynastyActive(state.selectedDynasty, currentYear)
        ? state.selectedDynasty
        : undefined,
  };
}

export const useHistoryStore = create<HistoryState>((set) => ({
  ...initialState,
  setCurrentYear: (year, isDynastyActive = () => true) =>
    set((state) => ({
      ...reduceHistoryState(state, { type: "setYear", year }, { isDynastyActive }),
      isPlaying: state.isPlaying && clampYear(year) < MAX_YEAR,
    })),
  selectDynasty: (selectedDynasty) => set({ selectedDynasty }),
  selectPerson: (selectedPerson) => set({ selectedPerson }),
  selectEvent: (selectedEvent) => set({ selectedEvent }),
  play: () => set((state) => ({ isPlaying: state.currentYear < MAX_YEAR })),
  pause: () => set({ isPlaying: false }),
  setAiDrawerOpen: (aiDrawerOpen) => set({ aiDrawerOpen }),
  reset: (state = {}) => set({ ...initialState, ...state }),
}));
