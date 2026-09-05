"use client";

import { Background, Controls, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps } from "@xyflow/react";
import { useEffect, useState } from "react";

import { relationLabels } from "./relation-legend";
import { PersonPortrait } from "./person-portrait";
import { relationHandles } from "./relation-handles";
import type { Person, PersonRelation } from "@/types/history";

type PortraitNode = Node<{ person: Person; isCenter: boolean }, "person">;
function PersonNode({ data }: NodeProps<PortraitNode>) {
  return <div className={`grid h-[132px] w-28 place-items-center rounded-2xl border ${data.isCenter ? "border-2 border-gold bg-cinnabar text-paper" : "border-ink/20 bg-paper text-ink"}`}>
    {Object.values(Position).flatMap((position) => (["source", "target"] as const).map((type) => <Handle key={`${type}-${position}`} id={`${type}-${position}`} type={type} position={position} isConnectable={false} className="!size-1.5 !border-paper !bg-[#8e8776]" />))}
    <span className="grid justify-items-center gap-1"><PersonPortrait person={data.person} variant="avatar" /><span className="font-serif text-sm">{data.person.name}</span></span>
  </div>;
}
const nodeTypes = { person: PersonNode };

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
  const radiusX = Math.max(260, others.length * 26);
  const radiusY = Math.max(190, others.length * 20);
  const graphPeople = [center, ...others];
  const nodes: PortraitNode[] = graphPeople.map((person, index) => {
    const isCenter = index === 0;
    const angle = (Math.PI * 2 * (index - 1)) / Math.max(others.length, 1);
    return {
      id: person.id,
      type: "person",
      ariaLabel: `聚焦${person.name}`,
      position: isCenter ? { x: 0, y: 0 } : { x: Math.cos(angle) * radiusX, y: Math.sin(angle) * radiusY },
      data: { person, isCenter },
    };
  });
  const positions = new Map(nodes.map((node) => [node.id, node.position]));
  const edges: Edge[] = relations.flatMap((relation) => {
    const source = positions.get(relation.sourcePersonId);
    const target = positions.get(relation.targetPersonId);
    if (!source || !target) return [];
    return [{ id: relation.id, source: relation.sourcePersonId, target: relation.targetPersonId,
      ...relationHandles(source, target), type: "straight", label: relationLabels[relation.type],
      markerEnd: { type: MarkerType.ArrowClosed, color: "#8e8776" }, style: { stroke: "#8e8776" },
      labelStyle: { fill: "#6e716b", fontSize: 10 }, labelBgStyle: { fill: "#f3f0e7" },
    }];
  });
  const groupedEdges = new Map<string, Edge>();
  for (const edge of edges) {
    const key = `${edge.source}:${edge.target}`;
    const existing = groupedEdges.get(key);
    if (existing) existing.label = `${existing.label} / ${edge.label}`;
    else groupedEdges.set(key, { ...edge });
  }
  if (!isDesktop) return null;

  return <div className="h-[35rem] overflow-hidden rounded-2xl border border-ink/10 bg-[linear-gradient(rgba(23,40,36,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(23,40,36,.04)_1px,transparent_1px)] bg-[size:28px_28px]" aria-label="人物一度关系图"><ReactFlow key={center.id} nodes={nodes} edges={[...groupedEdges.values()]} nodeTypes={nodeTypes} nodesDraggable={false} nodesConnectable={false} fitView fitViewOptions={{ padding: 0.18 }} minZoom={0.25} maxZoom={1.5} onNodeClick={(_, node) => onFocus(node.id)}><Background color="transparent" /><Controls showInteractive={false} /></ReactFlow></div>;
}
