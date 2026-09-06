import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { geoMercator } from "d3-geo";
import ts from "typescript";

const VIEW_BOX = [0, 0, 720, 760];
const PROJECTION = { center: [120, 35], scale: 1000, translate: [360, 390] };
const projection = geoMercator().center(PROJECTION.center).scale(PROJECTION.scale).translate(PROJECTION.translate);
const round = (value) => Math.round(value * 10) / 10;

export function projectMiniToolLocation(longitude, latitude) {
  return projection([longitude, latitude]).map(round);
}

function squaredSegmentDistance(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const t = dx || dy
    ? Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)))
    : 0;
  return (point[0] - start[0] - t * dx) ** 2 + (point[1] - start[1] - t * dy) ** 2;
}

// Simplify in display pixels, after planar projection. Spherical GeoJSON winding
// can describe the complement of the atlas polygons, so never stream these
// rings through d3's spherical polygon renderer.
function simplifyRing(ring) {
  const points = ring.map(([longitude, latitude]) => projection([longitude, latitude]));
  if (points.length < 5) return points;
  const keep = new Set([0, points.length - 1]);
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop();
    let maximum = 0.35 ** 2;
    let furthest = -1;
    for (let index = start + 1; index < end; index += 1) {
      const distance = squaredSegmentDistance(points[index], points[start], points[end]);
      if (distance > maximum) { maximum = distance; furthest = index; }
    }
    if (furthest !== -1) {
      keep.add(furthest);
      stack.push([start, furthest], [furthest, end]);
    }
  }
  const simplified = [...keep].sort((a, b) => a - b).map((index) => points[index]);
  // Preserve tiny islands and holes instead of dropping their geometry.
  return simplified.length >= 4 ? simplified : points;
}

function geometryPath(geometry) {
  if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") {
    throw new Error(`Unsupported mini-tool atlas geometry: ${geometry.type}`);
  }
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map((polygon) => polygon.map((ring) => {
    const points = simplifyRing(ring);
    return `M${points.slice(0, -1).map(([x, y]) => `${round(x)},${round(y)}`).join("L")}Z`;
  }).join("")).join("");
}

function originalRealmColors(projectRoot, readJSON) {
  const colors = Object.fromEntries(readJSON("data/maps/map-polities.json").map(({ id, color }) => [id, color]));
  const filename = resolve(projectRoot, "features/history-map/atlas/atlas-style.ts");
  const source = ts.createSourceFile(filename, readFileSync(filename, "utf8"), ts.ScriptTarget.Latest, true);
  let expression;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === "REALM_COLOR") expression = node.initializer;
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (!expression || !ts.isArrayLiteralExpression(expression)) throw new Error("Original atlas REALM_COLOR expression missing");
  const elements = expression.elements;
  const fallback = elements[elements.length - 1];
  if (!ts.isStringLiteral(fallback)) throw new Error("Original atlas fallback color missing");
  for (let index = 2; index + 1 < elements.length && !ts.isSpreadElement(elements[index]); index += 2) {
    if (!ts.isStringLiteral(elements[index]) || !ts.isStringLiteral(elements[index + 1])) {
      throw new Error("Unsupported original atlas color expression");
    }
    colors[elements[index].text] = elements[index + 1].text;
  }
  return { colors, fallback: fallback.text };
}

export function buildMiniToolAtlas(projectRoot) {
  const readJSON = (file) => JSON.parse(readFileSync(resolve(projectRoot, file), "utf8"));
  const registry = readJSON("data/maps/continuous-registry.json");
  const { colors, fallback } = originalRealmColors(projectRoot, readJSON);
  const paths = {};
  const pathIds = new Map();
  function intern(path) {
    if (!pathIds.has(path)) {
      const id = `p${pathIds.size}`;
      pathIds.set(path, id);
      paths[id] = path;
    }
    return pathIds.get(path);
  }
  const snapshots = {};
  for (const [id, manifest] of Object.entries(registry.manifests)) {
    const collection = readJSON(`public${manifest.files.realms}`);
    snapshots[id] = {
      id,
      startYear: manifest.validFromYear ?? manifest.anchorYear,
      endYear: manifest.validToYearExclusive ? manifest.validToYearExclusive - 1 : manifest.anchorYear,
      note: manifest.inferenceNotes.join(" "),
      confidence: manifest.confidence,
      sourceRefs: manifest.sourceRefs,
      regions: collection.features.map(({ properties, geometry }) => {
        const color = colors[properties.dynastyId] || fallback;
        return {
          id: properties.id,
          dynastyId: properties.dynastyId,
          name: properties.name,
          color,
          path: intern(geometryPath(geometry)),
          label: projectMiniToolLocation(properties.labelLongitude, properties.labelLatitude),
          accuracy: properties.accuracyLevel,
          sourceRefs: properties.sourceRefs,
          note: (properties.disputedNote || "").replace(/https?:\/\//g, ""),
        };
      }),
    };
  }
  const combinedPath = (file) => readJSON(file).features.map(({ geometry }) => geometryPath(geometry)).join("");
  return {
    viewBox: VIEW_BOX,
    projection: PROJECTION,
    years: Object.fromEntries(registry.years.map(({ year, snapshotId }) => [year, snapshotId])),
    snapshots,
    paths,
    landPath: combinedPath("gis/continuous/land-mask.geojson"),
    waterPath: combinedPath("public/maps/continuous/natural-water.geojson"),
    sourceNote: "沿用原项目943地区母版与年末政权归属；概括主要更替，非逐年精确疆域。自然陆地与湖泊：Natural Earth 1:10m，公版数据；仅作地理参照。",
  };
}
