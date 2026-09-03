export interface MapFallbackProps {
  state: "loading" | "unavailable";
  detail?: string;
}

export function MapFallback({ state, detail }: MapFallbackProps) {
  const message =
    state === "loading"
      ? "正在载入 943 年高保真地图"
      : "高保真地图暂不可用，已切回示意图";

  return (
    <div
      role="status"
      aria-live="polite"
      className="border border-[var(--border)] bg-paper/90 px-4 py-3 text-sm text-muted shadow-sm"
    >
      <p className="font-semibold text-ink">{message}</p>
      {detail ? <p className="mt-1 text-xs leading-5">{detail}</p> : null}
    </div>
  );
}
