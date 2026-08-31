import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HistoryProvider } from "@/features/history-state/history-provider";
import { useHistoryStore } from "@/features/history-state/history-store";

const navigation = vi.hoisted(() => ({
  pathname: "/map",
  query: "year=936",
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => new URLSearchParams(navigation.query),
}));

function renderProvider() {
  const view = <HistoryProvider><div>history</div></HistoryProvider>;
  const result = render(view);
  return {
    commit(query: string, pathname = navigation.pathname) {
      act(() => {
        navigation.pathname = pathname;
        navigation.query = query;
        result.rerender(
          <HistoryProvider><div>history</div></HistoryProvider>,
        );
      });
    },
  };
}

describe("HistoryProvider URL synchronization", () => {
  beforeEach(() => {
    navigation.pathname = "/map";
    navigation.query = "year=936";
    navigation.replace.mockReset();
    useHistoryStore.getState().reset({ currentYear: 936 });
  });

  afterEach(cleanup);

  it("keeps a rapid open then close closed when the old open URL commits late", () => {
    const { commit } = renderProvider();

    act(() => useHistoryStore.getState().selectDynasty("later-jin"));
    expect(navigation.replace).toHaveBeenLastCalledWith(
      "/map?year=936&dynasty=later-jin",
      { scroll: false },
    );

    act(() => useHistoryStore.getState().selectDynasty(undefined));
    expect(navigation.replace).toHaveBeenLastCalledWith(
      "/map?year=936",
      { scroll: false },
    );

    commit("year=936&dynasty=later-jin");
    expect(useHistoryStore.getState().selectedDynasty).toBeUndefined();
    expect(navigation.replace).toHaveBeenLastCalledWith(
      "/map?year=936",
      { scroll: false },
    );

    commit("year=936");
    expect(useHistoryStore.getState().selectedDynasty).toBeUndefined();
  });

  it("makes the last of rapid A to B to none updates win", () => {
    const { commit } = renderProvider();

    act(() => useHistoryStore.getState().selectDynasty("later-jin"));
    act(() => useHistoryStore.getState().selectDynasty("liao"));
    act(() => useHistoryStore.getState().selectDynasty(undefined));

    expect(navigation.replace.mock.calls.slice(0, 3)).toEqual([
      ["/map?year=936&dynasty=later-jin", { scroll: false }],
      ["/map?year=936&dynasty=liao", { scroll: false }],
      ["/map?year=936", { scroll: false }],
    ]);

    commit("year=936&dynasty=later-jin");
    expect(useHistoryStore.getState().selectedDynasty).toBeUndefined();
    commit("year=936&dynasty=liao");
    expect(useHistoryStore.getState().selectedDynasty).toBeUndefined();
    commit("year=936");
    expect(useHistoryStore.getState().selectedDynasty).toBeUndefined();
  });

  it("accepts browser URL changes after the internal navigation settles", () => {
    const { commit } = renderProvider();

    act(() => useHistoryStore.getState().selectDynasty("later-jin"));
    commit("year=936&dynasty=later-jin");
    expect(useHistoryStore.getState().selectedDynasty).toBe("later-jin");

    commit("year=936");
    expect(useHistoryStore.getState().selectedDynasty).toBeUndefined();
  });

  it("accepts a new pathname without replaying pending state from the old route", () => {
    const { commit } = renderProvider();

    act(() => useHistoryStore.getState().selectDynasty("later-jin"));
    commit("year=978&person=li-yu", "/people");

    expect(useHistoryStore.getState()).toMatchObject({
      currentYear: 978,
      selectedDynasty: undefined,
      selectedPerson: "li-yu",
    });
    expect(navigation.replace).toHaveBeenCalledTimes(1);
  });
});
