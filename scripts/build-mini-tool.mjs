import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(projectRoot, "mini-tool/src");
const distRoot = resolve(projectRoot, "output/xhs-mini-tool/dist");
const assetsRoot = resolve(distRoot, "assets");
const moduleCache = new Map();
const diagnosticHost = {
  getCanonicalFileName: (filename) => filename,
  getCurrentDirectory: () => projectRoot,
  getNewLine: () => "\n",
};

function resolveLocalModule(fromFile, specifier) {
  const base = specifier.startsWith("@/")
    ? resolve(projectRoot, specifier.slice(2))
    : resolve(dirname(fromFile), specifier);
  for (const candidate of [base, `${base}.ts`, join(base, "index.ts")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  throw new Error(`Unsupported build-time import: ${specifier} from ${fromFile}`);
}

function loadTypeScriptModule(filename) {
  const absolute = resolve(filename);
  if (moduleCache.has(absolute)) return moduleCache.get(absolute).exports;
  const module = { exports: {} };
  moduleCache.set(absolute, module);
  const source = readFileSync(absolute, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
    fileName: absolute,
    reportDiagnostics: true,
  });
  const diagnostics = output.diagnostics || [];
  if (diagnostics.some((item) => item.category === ts.DiagnosticCategory.Error)) {
    throw new Error(ts.formatDiagnosticsWithColorAndContext(diagnostics, diagnosticHost));
  }
  const wrapper = new Function("require", "module", "exports", output.outputText);
  wrapper((specifier) => loadTypeScriptModule(resolveLocalModule(absolute, specifier)), module, module.exports);
  return module.exports;
}

function optionalText(value) {
  return typeof value === "string" ? value : "";
}

const { seedData } = loadTypeScriptModule(resolve(projectRoot, "data/seed/index.ts"));
const data = {
  meta: {
    title: "一卷山河",
    description: "轻松逛懂五代十国",
    minYear: 875,
    maxYear: 979,
  },
  dynasties: seedData.dynasties.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    startYear: item.startYear,
    endYear: item.endYear,
    summary: item.summary,
    color: item.color,
  })),
  people: seedData.people.map((item) => ({
    id: item.id,
    name: item.name,
    aliases: item.aliases || [],
    dynastyIds: item.dynastyIds,
    roles: item.roles,
    summary: item.summary,
    biography: optionalText(item.biography),
  })),
  events: seedData.events
    .slice()
    .sort((left, right) => left.startYear - right.startYear || (left.orderInYear || 0) - (right.orderInYear || 0))
    .map((item) => ({
      id: item.id,
      title: item.title,
      eventType: item.eventType,
      tracks: item.tracks,
      startYear: item.startYear,
      ...(item.endYear === undefined ? {} : { endYear: item.endYear }),
      summary: item.summary,
      background: item.background,
      process: item.process,
      result: item.result,
      impact: item.impact,
      personIds: item.personIds,
      dynastyIds: item.dynastyIds,
      locationIds: item.locationIds,
      sourceRefs: item.sourceRefs,
      disputedNote: optionalText(item.disputedNote),
    })),
  locations: seedData.locations.map((item) => ({
    id: item.id,
    name: item.name,
    longitude: item.longitude,
    latitude: item.latitude,
    modernReference: optionalText(item.modernReference),
  })),
};

rmSync(distRoot, { recursive: true, force: true });
mkdirSync(assetsRoot, { recursive: true });
cpSync(resolve(sourceRoot, "index.html"), resolve(distRoot, "index.html"));
cpSync(resolve(sourceRoot, "styles.css"), resolve(assetsRoot, "styles.css"));
cpSync(resolve(sourceRoot, "app.js"), resolve(assetsRoot, "app.js"));
writeFileSync(resolve(assetsRoot, "data.js"), `window.__MINI_TOOL_DATA__=${JSON.stringify(data)};\n`, "utf8");

console.log(`Built Xiaohongshu mini tool at ${distRoot}`);
