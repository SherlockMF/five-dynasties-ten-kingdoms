import { MapPin } from "lucide-react";

import type { HistoricalLocation } from "@/types/history";

export function EventLocation({ locations }: { locations: HistoricalLocation[] }) {
  if (!locations.length) return null;
  return (
    <section aria-label={`事件地点，共 ${locations.length} 处`} className="relative min-w-0 overflow-hidden rounded-2xl bg-ink p-6 text-paper">
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-12 size-48 rounded-full border border-gold/25" />
      <p className="relative flex items-center gap-2 text-[10px] tracking-[0.16em] text-gold uppercase">
        <MapPin aria-hidden="true" className="size-4" />地图坐标 · {locations.length} 处
      </p>
      {locations.length > 3 ? <p className="relative mt-2 text-xs text-paper/70">向下滚动查看全部地点</p> : null}
      <ul aria-label="地点坐标" tabIndex={locations.length > 3 ? 0 : undefined} className="relative mt-5 max-h-80 space-y-4 overflow-y-auto overscroll-contain rounded-sm pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
        {locations.map((location) => (
          <li key={location.id} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
            <b className="font-serif text-lg">{location.name}</b>
            <small className="mt-1 block text-paper/70">{location.modernReference}</small>
            <code className="mt-2 block text-[10px] text-paper/70">{location.longitude.toFixed(2)}°E · {location.latitude.toFixed(2)}°N</code>
          </li>
        ))}
      </ul>
    </section>
  );
}
