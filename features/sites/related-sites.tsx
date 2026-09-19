import Link from "next/link";
import { getArchiveHref } from "@/data/sites";
import type { HistorySiteConfig } from "@/types/site";

export function RelatedSites({ sites, title = "相关历史现场", inverse = false }: {
  sites: readonly HistorySiteConfig[];
  title?: string;
  inverse?: boolean;
}) {
  if (!sites.length) return null;
  return <section className={`mt-6 border-t pt-5 ${inverse ? "border-paper/20" : "border-ink/15"}`}>
    <h2 className={`text-sm ${inverse ? "text-gold" : "text-muted"}`}>{title}</h2>
    <ul className="mt-3 space-y-4">{sites.map(site => <li key={site.id}>
      <Link href={getArchiveHref(site)} className={`inline-flex min-h-11 items-center font-serif text-xl underline-offset-4 hover:underline ${inverse ? "text-paper" : "text-cinnabar"}`}>{site.title} ↗</Link>
      <p className={`mt-1 text-xs leading-6 ${inverse ? "text-paper/75" : "text-muted"}`}>{site.description}</p>
    </li>)}</ul>
  </section>;
}
