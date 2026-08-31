import type { PersonRelationType } from "@/types/history";

export const relationLabels: Record<PersonRelationType, string> = {
  family: "亲属",
  ally: "盟友",
  enemy: "敌人",
  "ruler-subject": "君臣",
  political: "政治关系",
  succession: "继承",
};

export function RelationLegend() {
  return <div className="flex flex-wrap gap-2 text-[10px] tracking-[0.08em] text-muted">{Object.entries(relationLabels).map(([type, label]) => <span key={type} className="rounded-full border border-ink/10 px-2.5 py-1">{label}</span>)}</div>;
}
