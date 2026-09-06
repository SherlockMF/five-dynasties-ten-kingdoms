import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import sharp from "sharp";
import { buildMiniToolAtlas, projectMiniToolLocation } from "./build-mini-tool-atlas.mjs";

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
  const loadedModule = { exports: {} };
  moduleCache.set(absolute, loadedModule);
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
  wrapper((specifier) => loadTypeScriptModule(resolveLocalModule(absolute, specifier)), loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

function optionalText(value) {
  return typeof value === "string" ? value : "";
}

const { seedData } = loadTypeScriptModule(resolve(projectRoot, "data/seed/index.ts"));
const { portraits } = loadTypeScriptModule(resolve(projectRoot, "data/portraits.ts"));
const { buildPersonPrompt } = loadTypeScriptModule(resolve(projectRoot, "lib/ai/persona.ts"));
const { personEventDialogues } = loadTypeScriptModule(resolve(projectRoot, "data/person-dialogues.ts"));
const data = {
  personDialogues: personEventDialogues,
  personRelations: seedData.personRelations.map(({ sourcePersonId, targetPersonId, type, description, sourceRefs }) => ({ sourcePersonId, targetPersonId, type, description, sourceRefs })),
  eventRelations: seedData.eventRelations.map(({ sourceEventId, targetEventId, type }) => ({ sourceEventId, targetEventId, type })),
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
    prompt: buildPersonPrompt(item, "history"),
    sourceRefs: item.sourceRefs,
    disputedNote: optionalText(item.disputedNote),
    portrait: portraits[item.id] ? {
      src: `./assets/portraits/${item.id}.webp`,
      kind: portraits[item.id].kind,
      sourceTitle: portraits[item.id].source?.title || "",
      note: portraits[item.id].note.replace(/https?:\/\/\S+/g, ""),
    } : null,
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
    mapPoint: projectMiniToolLocation(item.longitude, item.latitude),
  })),
};
data.atlas = await buildMiniToolAtlas(projectRoot);

rmSync(distRoot, { recursive: true, force: true });
mkdirSync(assetsRoot, { recursive: true });
cpSync(resolve(sourceRoot, "index.html"), resolve(distRoot, "index.html"));
cpSync(resolve(sourceRoot, "styles.css"), resolve(assetsRoot, "styles.css"));
cpSync(resolve(sourceRoot, "app.js"), resolve(assetsRoot, "app.js"));
cpSync(resolve(sourceRoot, "assets/icon.png"), resolve(assetsRoot, "icon.png"));
mkdirSync(resolve(assetsRoot, "portraits"), { recursive: true });
for (const person of seedData.people) {
  const portrait = portraits[person.id];
  if (!portrait) throw new Error(`Missing portrait: ${person.id}`);
  await sharp(resolve(projectRoot, "public", portrait.src.slice(1)))
    .resize(240, 320, { fit: "cover" }).webp({ quality: 65 })
    .toFile(resolve(assetsRoot, "portraits", `${person.id}.webp`));
}
writeFileSync(resolve(assetsRoot, "data.js"), `window.__MINI_TOOL_DATA__=${JSON.stringify(data)};\n`, "utf8");

console.log(`Built Xiaohongshu mini tool at ${distRoot}`);
