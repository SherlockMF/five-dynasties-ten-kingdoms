"use client";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ArchiveView } from "@/types/archive";
import { SourceLinks } from "./archive-record";

export function RelationshipRecord({ view }: { view: ArchiveView }) {
  const people = view.entries.filter(e => e.type === "person" && e.state !== "hidden");
  const nodes = people.map(p => ({ id: p.id, position: p.position ?? { x: 0, y: 0 }, data: { label: p.title }, style: { background: "#f3f0e8", color: "#1e302c", border: "1px solid #a33e32", borderRadius: 0, padding: 16 } }));
  const edges = view.relations.map(r => ({ id: r.id, source: r.from, target: r.to, label: r.label, type: "smoothstep" }));
  return <>
    <div aria-label="已发现人物关系图" className="h-80 border border-ink/15 sm:h-[460px]">
      <ReactFlow key={nodes.map(n => n.id).join(",")} nodes={nodes} edges={edges} fitView fitViewOptions={{ maxZoom: 1 }} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} minZoom={0.3} maxZoom={1.5} preventScrolling={false}><Background gap={24} color="#ddd8cc" /><Controls showInteractive={false} /></ReactFlow>
    </div>
    <p className="mt-4 text-sm leading-7 text-muted">已记录 {people.length} 位人物，{view.relations.length} 条关系。关系随现场记录补充。</p>
    <ul aria-label="已发现关系列表" className="mt-4 divide-y divide-ink/10">{view.relations.map(r => <li key={r.id} id={`entry-${r.id}`} className="scroll-mt-24 py-3 text-sm">{people.find(p => p.id === r.from)?.title} — {r.label} — {people.find(p => p.id === r.to)?.title}<SourceLinks ids={r.sourceRefs} /></li>)}</ul>
  </>;
}
