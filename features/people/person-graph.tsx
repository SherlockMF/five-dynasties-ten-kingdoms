"use client";

import { Background, Controls, MarkerType, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { useEffect, useState } from "react";

import { relationLabels } from "./relation-legend";
import type { Person, PersonRelation } from "@/types/history";

export function PersonGraph({ center, people, relations, onFocus }: { center: Person; people: Person[]; relations: PersonRelation[]; onFocus: (id: string) => void }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateViewport = () => setIsDesktop(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const others = people.filter((person) => person.id !== center.id);
  const nodes: Node[] = [{ id: center.id, position: { x: 300, y: 150 }, data: { label: center.name }, style: { background: "#9f4036", color: "#f3f0e7", border: "0", borderRadius: 999, width: 82, height: 82, display: "grid", placeItems: "center", fontFamily: "serif" } }, ...others.map((person, index) => { const angle = (Math.PI * 2 * index) / Math.max(others.length, 1); return { id: person.id, position: { x: 300 + Math.cos(angle) * 220, y: 150 + Math.sin(angle) * 130 }, data: { label: person.name }, style: { background: "#f3f0e7", color: "#172824", border: "1px solid rgba(23,40,36,.2)", borderRadius: 999, width: 70, height: 70, display: "grid", placeItems: "center", fontFamily: "serif" } }; })];
  const edges: Edge[] = relations.map((relation) => ({ id: relation.id, source: relation.sourcePersonId, target: relation.targetPersonId, label: relationLabels[relation.type], markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#8e8776" }, labelStyle: { fill: "#6e716b", fontSize: 10 } }));
  if (!isDesktop) return null;

  return <div className="h-[31rem] overflow-hidden rounded-2xl border border-ink/10 bg-[linear-gradient(rgba(23,40,36,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(23,40,36,.04)_1px,transparent_1px)] bg-[size:28px_28px]" aria-label="人物一度关系图"><ReactFlow nodes={nodes} edges={edges} fitView minZoom={0.5} maxZoom={1.5} onNodeClick={(_, node) => onFocus(node.id)}><Background color="transparent" /><Controls showInteractive={false} /></ReactFlow></div>;
}
