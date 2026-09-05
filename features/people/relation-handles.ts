type Point = { x: number; y: number };

export function relationHandles(source: Point, target: Point) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  // Compare against the card's half-width/height to choose the nearest side.
  const horizontal = Math.abs(dx) / 56 >= Math.abs(dy) / 66;
  const sourceSide = horizontal ? dx >= 0 ? "right" : "left" : dy >= 0 ? "bottom" : "top";
  const opposite = { left: "right", right: "left", top: "bottom", bottom: "top" };
  return { sourceHandle: `source-${sourceSide}`, targetHandle: `target-${opposite[sourceSide]}` };
}
