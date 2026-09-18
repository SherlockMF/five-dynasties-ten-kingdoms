import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const sha256 = value => createHash("sha256").update(value).digest("hex");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function validateArchiveContent({ entries, sources, illustrations, manifest, drafts }) {
  const unique = (values, label) => assert(new Set(values).size === values.length, `${label} 必须唯一。`);
  unique(entries.map(e => e.id), "ArchiveEntry ID");
  unique(entries.map(e => e.key), "ArchiveEntry key");
  unique(sources.map(s => s.id), "Source ID");
  const sourceIds = new Set(sources.map(s => s.id));
  const byId = new Map(entries.map(e => [e.id, e]));
  const refs = values => {
    assert(Array.isArray(values) && values.length > 0, "缺少 sourceRefs。");
    for (const id of values) assert(sourceIds.has(id), `未知 sourceRef：${id}`);
  };
  for (const source of sources) {
    assert(["primary", "museum", "research", "transcript"].includes(source.level), `非法来源等级：${source.id}`);
    for (const id of source.titleRequires ?? []) assert(byId.has(id), `未知来源标题依赖：${id}`);
  }
  for (const entry of entries) {
    assert(/^li-jingxun\.[a-z0-9.-]+$/.test(entry.key), `非法 key：${entry.key}`);
    for (const block of entry.blocks) {
      refs(block.sourceRefs);
      assert(["observed", "catalogued", "contextualized"].includes(block.state), `非法 block state：${entry.id}`);
      for (const id of block.requires ?? []) assert(byId.has(id), `未知 block 依赖：${id}`);
    }
    if (entry.type === "relation") {
      assert(entry.endpoints?.length === 2, `关系缺少两端：${entry.id}`);
      for (const id of entry.endpoints) assert(byId.get(id)?.type === "person", `关系端点必须为已定义人物：${id}`);
    }
  }
  const assets = manifest.illustrations ?? [];
  unique(assets.map(a => a.id), "Illustration ID");
  for (const [id, image] of Object.entries(illustrations)) {
    const asset = assets.find(a => a.id === id);
    assert(asset?.rights === "RUNTIME_ALLOWED" && asset.sourcePath && asset.rightsBasis, `图片缺少 runtime 来源/权利记录：${id}`);
    assert(image.startsWith("data:image/svg+xml;base64,"), `未经审核的图片格式：${id}`);
    const bytes = Buffer.from(image.split(",")[1], "base64");
    assert(sha256(bytes) === asset.sha256, `图片内容与 manifest 不符：${id}`);
    const svg = bytes.toString("utf8");
    assert(!/<(?:image|script|foreignObject)\b|(?:href|src)\s*=\s*["'](?!#)/i.test(svg), `示意图含未审核嵌入资源：${id}`);
    assert(/示意|线稿/.test(svg), `示意图缺少复原说明：${id}`);
    assert(byId.get(asset.entryId)?.image === image, `图片与条目绑定不符：${id}`);
  }
  for (const entry of entries.filter(e => e.image)) {
    assert(Object.values(illustrations).includes(entry.image), `运行时图片没有 manifest：${entry.id}`);
  }
  const text = entries.map(e => [e.title, ...e.blocks.map(b => `${b.label} ${b.text}`)].join("\n")).join("\n");
  assert(!/鸡血石|雞血石/.test(text), "正式内容含禁用的项链材质名称。");
  assert(byId.get("P05")?.title === "宇文赟", "外祖父人物不得误作宇文邕。");
  assert(!/(?:宇文邕[^。\n]{0,50}外祖父|外祖父[^。\n]{0,50}宇文邕)/.test(text), "外祖父关系文案错误。");
  assert(drafts.status === "uncollated-do-not-publish", "墓志草稿不得升级为已核全文。");
  assert(manifest.epitaph?.fullTextCollated === false, "V1 未完成全文原石校勘。");
  assert(!/已核全文|全文已核|全文核验通过|原石全文已校/.test(text), "正式内容错误宣称全文墓志已核。");
  for (const fragment of drafts.fragments) refs(fragment.sourceRefs);
  assert(!entries.some(e => e.blocks.some(b => drafts.fragments.some(f => b.text.includes(f.quote)))), "未校草稿直接进入正式展示。");
}

function main() {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const read = path => readFileSync(resolve(root, path), "utf8");
  const manifest = JSON.parse(read("docs/archive/li-jingxun-source-manifest.json"));
  // Evaluate only these local data modules; server-only is a Next bundler marker.
  const modules = new Map([["server-only", {}]]);
  for (const name of ["illustrations", "sources", "catalogue"]) {
    const output = ts.transpileModule(read(`data/archives/li-jingxun/${name}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const exports = {};
    runInNewContext(output, { exports, require: id => {
      assert(modules.has(id), `未经允许的数据模块依赖：${id}`);
      return modules.get(id);
    } });
    modules.set(`./${name}`, exports);
  }
  const { archiveEntries: entries, archiveSources: sources } = modules.get("./catalogue");
  validateArchiveContent({ entries, sources, illustrations: modules.get("./illustrations").illustrations, manifest, drafts: JSON.parse(read("data/archives/li-jingxun/epitaph-drafts.json")) });
  const runtimeFiles = execFileSync("rg", ["--files", "app", "features", "lib", "data/archives"], { cwd: root, encoding: "utf8" }).trim().split(/\r?\n/);
  for (const path of runtimeFiles) assert(!/(?:import|export|require)[^;\n]*epitaph-drafts/.test(read(path)), `运行时代码导入未核全文草稿：${path}`);
  console.log(`内容校验通过：${entries.length} 个条目，${sources.length} 个来源，${manifest.illustrations.length} 张 runtime 示意图。`);

  const current = execFileSync("rg", ["--files", "--hidden", "-g", "!.git", "-g", "!node_modules", "-g", "!.next", "-g", "!.netlify"], { cwd: manifest.source, encoding: "utf8" }).trim().split(/\r?\n/).sort();
  assert(JSON.stringify(current) === JSON.stringify(manifest.files.map(f => f.path)), "只读参考源文件清单发生变化。");
  for (const file of manifest.files) assert(sha256(readFileSync(resolve(manifest.source, file.path))) === file.sha256, `只读参考源内容发生变化：${file.path}`);
  for (const asset of manifest.illustrations) assert(sha256(readFileSync(resolve(manifest.source, asset.sourcePath))) === asset.sha256, `示意图与原创参考源不符：${asset.id}`);
  assert(sha256(readFileSync(manifest.gameSourcePack.path)) === manifest.gameSourcePack.sha256, "Game Source Pack 已改变，需要重新审计冻结表。");
  console.log(`只读参考源校验通过：${current.length} 个文件，SHA-256 均未变化；Game Source Pack 与冻结版本一致。`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main();
