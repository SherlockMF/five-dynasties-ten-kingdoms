import Link from "next/link";
import { X } from "lucide-react";
import { MAP_MIN_YEAR, MAX_YEAR } from "@/lib/history/year-range";
import type { Dynasty } from "@/types/history";

export function InactiveDynastyNotice({ dynasty, year, onClose }: { dynasty: Dynasty; year: number; onClose: () => void }) {
  const ended = year >= dynasty.endYear;
  const notFounded = year < dynasty.startYear;
  const referenceYear = ended ? dynasty.endYear - 1 : notFounded ? dynasty.startYear : undefined;
  return (
    <section aria-label="已选政权说明" className="relative border-b border-gold/40 bg-gold/10 px-4 py-4 pr-14">
      <button type="button" aria-label="取消政权选择" onClick={onClose} className="absolute right-2 top-2 grid size-11 place-items-center rounded-full hover:bg-ink/5 focus-visible:outline-cinnabar"><X aria-hidden="true" className="size-4" /></button>
      <h2 className="font-serif text-lg">{dynasty.name} · {dynasty.startYear}—{dynasty.endYear}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/75">{ended ? `其政权存续已于${dynasty.endYear}年结束；当前地图显示${year}年年末格局，因此没有该政权的控制范围。` : notFounded ? `本政权于${dynasty.startYear}年建立，尚未出现在${year}年地图中。` : `本站未收录${year}年该政权的控制范围，不能据此推断其不存在。`}</p>
      {referenceYear !== undefined && referenceYear >= MAP_MIN_YEAR && referenceYear <= MAX_YEAR ? <Link href={`/map?year=${referenceYear}&dynasty=${dynasty.id}`} className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-cinnabar underline underline-offset-4 focus-visible:outline-cinnabar">查看{referenceYear}年地图 →</Link> : null}
    </section>
  );
}
