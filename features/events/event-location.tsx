import { MapPin } from "lucide-react";

import type { HistoricalLocation } from "@/types/history";

export function EventLocation({ locations }: { locations: HistoricalLocation[] }) {
  if (!locations.length) return null;
  return <div className="relative overflow-hidden rounded-2xl bg-ink p-6 text-paper"><div className="absolute -right-8 -top-12 size-48 rounded-full border border-gold/25" /><p className="flex items-center gap-2 text-[10px] tracking-[0.16em] text-gold uppercase"><MapPin aria-hidden="true" className="size-4" />地图坐标</p><div className="mt-5 space-y-4">{locations.map((location) => <div key={location.id} className="flex items-end justify-between gap-4 border-b border-white/10 pb-3"><div><b className="font-serif text-lg">{location.name}</b><small className="mt-1 block text-paper/50">{location.modernReference}</small></div><code className="text-[10px] text-paper/55">{location.longitude.toFixed(2)}°E · {location.latitude.toFixed(2)}°N</code></div>)}</div></div>;
}
