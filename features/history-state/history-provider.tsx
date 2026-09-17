"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { getRouteSeries } from "@/data/series";

import { useHistoryStore } from "./history-store";
import { parseHistoryQuery, serializeHistoryQuery } from "./history-url";

interface RouteSnapshot {
  pathname: string;
  query: string;
}

function routesMatch(left: RouteSnapshot, right: RouteSnapshot) {
  return left.pathname === right.pathname && left.query === right.query;
}

function routeHref(route: RouteSnapshot) {
  return route.query ? `${route.pathname}?${route.query}` : route.pathname;
}

export function HistoryProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const series = getRouteSeries(pathname);
  const routePrefix = (pathname.startsWith("/series/") || series.id !== "five-dynasties") ? `/series/${series.slug}` : "";
  const initialized = useRef(false);
  const observedRoute = useRef<RouteSnapshot | null>(null);
  const latestDesiredRoute = useRef<RouteSnapshot | null>(null);
  const pendingInternalRoute = useRef<RouteSnapshot | null>(null);
  const applyingUrl = useRef(false);

  const resetStoreFromUrl = useCallback((incomingQuery: string) => {
    const parsed = parseHistoryQuery(incomingQuery, series);
    const state = useHistoryStore.getState();
    if (
      state.series.id === series.id && state.routePrefix === routePrefix &&
      parsed.currentYear === state.currentYear &&
      parsed.selectedDynasty === state.selectedDynasty &&
      parsed.selectedPerson === state.selectedPerson &&
      parsed.selectedEvent === state.selectedEvent
    ) {
      return;
    }
    applyingUrl.current = true;
    try {
      state.reset({
        ...parsed,
        series,
        routePrefix,
        isPlaying: false,
        aiDrawerOpen: series.id === "five-dynasties" && state.aiDrawerOpen,
      });
    } finally {
      applyingUrl.current = false;
    }
  }, [series, routePrefix]);

  useEffect(() => {
    const incoming = { pathname, query };
    if (!initialized.current) {
      observedRoute.current = incoming;
      latestDesiredRoute.current = incoming;
      pendingInternalRoute.current = null;
      useHistoryStore.getState().reset({ ...parseHistoryQuery(query, series), series, routePrefix });
      initialized.current = true;
      return;
    }

    const observed = observedRoute.current;
    if (observed?.pathname !== incoming.pathname) {
      observedRoute.current = incoming;
      latestDesiredRoute.current = incoming;
      pendingInternalRoute.current = null;
      resetStoreFromUrl(query);
      return;
    }
    if (observed && routesMatch(observed, incoming)) return;

    observedRoute.current = incoming;
    const desired = latestDesiredRoute.current ?? incoming;
    if (pendingInternalRoute.current) {
      if (routesMatch(incoming, desired)) {
        pendingInternalRoute.current = null;
        return;
      }
      pendingInternalRoute.current = desired;
      router.replace(routeHref(desired), { scroll: false });
      return;
    }

    latestDesiredRoute.current = incoming;
    resetStoreFromUrl(query);
  }, [pathname, query, router, series, routePrefix, resetStoreFromUrl]);

  useEffect(() => {
    return useHistoryStore.subscribe((state, previous) => {
      if (!initialized.current || applyingUrl.current) return;
      const changed =
        state.currentYear !== previous.currentYear ||
        state.selectedDynasty !== previous.selectedDynasty ||
        state.selectedPerson !== previous.selectedPerson ||
        state.selectedEvent !== previous.selectedEvent;
      if (!changed) return;
      const observed = observedRoute.current;
      if (!observed) return;
      if (observed.pathname === "/" || observed.pathname === "/series" || observed.pathname.startsWith("/archive/") || observed.pathname.startsWith("/investigate/")) return;
      const desired = {
        pathname: observed.pathname,
        query: serializeHistoryQuery(state),
      };
      latestDesiredRoute.current = desired;
      if (
        pendingInternalRoute.current ||
        !routesMatch(desired, observed)
      ) {
        pendingInternalRoute.current = desired;
        if ((observed.pathname === "/map" || /^\/series\/[^/]+\/map$/.test(observed.pathname)) && state.currentYear !== previous.currentYear) {
          // Map years are client-side state; no RSC navigation per playback tick.
          window.history.replaceState(null, "", routeHref(desired));
        } else {
          router.replace(routeHref(desired), { scroll: false });
        }
      }
    });
  }, [router]);

  return children;
}
