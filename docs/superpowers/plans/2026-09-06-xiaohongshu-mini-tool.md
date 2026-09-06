# Xiaohongshu Mini Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, validate, and package the existing Five Dynasties and Ten Kingdoms content as the offline Xiaohongshu mini tool “一卷山河”, with a ready-to-upload icon and compliance summary.

**Architecture:** Keep the existing Next.js product unchanged and add a dedicated static artifact under `mini-tool/src`. A Node build script loads the typed local seed modules through the installed TypeScript compiler, emits a reduced classic-script data bundle, copies the static shell, and a Python standard-library packager creates a root-level ZIP. The mini tool uses DOM, CSS, and inline SVG only; it performs no networking and uses no restricted container APIs.

**Tech Stack:** HTML5, CSS, ES2017 classic JavaScript, inline SVG, Node.js 24 standard library, installed TypeScript compiler, Python 3 `zipfile`, Vitest/jsdom, Xiaohongshu `minitool-zip-builder` 1.6.0 audit scripts, built-in image generation.

## Global Constraints

- The ZIP root contains exactly one `index.html`; no parent directory wraps the artifact.
- Final ZIP target is below 2 MiB and must not exceed 10 MiB.
- JavaScript output targets ES2017 / Chrome 61 and uses classic scripts only; no inline script, `type="module"`, `import`, or `export` appears in the artifact.
- All resource URLs are relative and local; runtime networking, external links, Worker, WebGL, clipboard, iframe/object, download, dynamic code execution, and unsupported device APIs are absent.
- CSS has a Chrome 61 baseline; it does not rely on Flex gap, `aspect-ratio`, `clamp()`, logical properties, `:has()`, container queries, dynamic viewport units, or modern color functions.
- Name is `一卷山河`; description is `轻松逛懂五代十国`.
- Icon is a 1:1 PNG under 5 MiB using the approved A1 “山河入城” concept, with no text or third-party marks.
- The tool requests no sensitive permission, collects no personal information, transmits no data, embeds no advertising, and includes clear scope, source, AI, and map-accuracy notices.
- Without Xiaohongshu simulator or physical-device evidence, the final summary says Chrome 61 compatibility, container behavior, and physical-device performance are untested.

---

### Task 1: Install and pin the Xiaohongshu build skill

**Files:**
- Create: `.codex/skills/minitool-zip-builder/SKILL.md`
- Create: `.codex/skills/minitool-zip-builder/skill-package.json`
- Create: `.codex/skills/minitool-zip-builder/references/*.md`
- Create: `.codex/skills/minitool-zip-builder/scripts/audit_artifact.mjs`
- Create: `.codex/skills/minitool-zip-builder/scripts/audit_artifact.py`
- Create: `tests/mini-tool-skill.test.ts`

**Interfaces:**
- Consumes: `https://fe-static.xhscdn.com/mini-tool/20260831163932/minitool-zip-builder-1.6.0.skill`.
- Produces: workspace-local skill root `.codex/skills/minitool-zip-builder` and audit entry point `.codex/skills/minitool-zip-builder/scripts/audit_artifact.py`.

- [ ] **Step 1: Write the failing skill integrity test**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("workspace mini-tool skill", () => {
  it("pins the expected package and audit files", () => {
    const root = resolve(".codex/skills/minitool-zip-builder");
    expect(JSON.parse(readFileSync(resolve(root, "skill-package.json"), "utf8"))).toEqual({
      name: "minitool-zip-builder",
      version: "1.6.0",
      format: "cursor-skill-zip-v1",
    });
    expect(readFileSync(resolve(root, "SKILL.md"), "utf8")).toContain("小工具 ZIP 构建指南");
    expect(readFileSync(resolve(root, "scripts/audit_artifact.py"), "utf8")).toContain("def ");
  });
});
```

- [ ] **Step 2: Run the test and confirm the workspace-local skill is missing**

Run: `npm test -- --run tests/mini-tool-skill.test.ts`

Expected: FAIL because `.codex/skills/minitool-zip-builder/skill-package.json` does not exist.

- [ ] **Step 3: Verify and extract the downloaded archive**

Run in PowerShell:

```powershell
$archive = 'C:\Users\84754\AppData\Local\Temp\wudaishiguo-xhs-audit\minitool-zip-builder-1.6.0.skill'
$destination = 'D:\OPC\wudaishiguo\.codex\skills'
tar -tf $archive
New-Item -ItemType Directory -Force -Path $destination | Out-Null
tar -xf $archive -C $destination
```

Expected: the archive lists only `minitool-zip-builder/` files documented in the specification, and extraction creates the exact skill root without overwriting unrelated files.

- [ ] **Step 4: Re-run the integrity test**

Run: `npm test -- --run tests/mini-tool-skill.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the pinned skill**

```powershell
git add .codex/skills/minitool-zip-builder tests/mini-tool-skill.test.ts
git commit -m "build: pin xiaohongshu mini tool skill"
```

---

### Task 2: Build a reduced artifact from typed seed data

**Files:**
- Create: `mini-tool/src/index.html`
- Create: `mini-tool/src/styles.css`
- Create: `mini-tool/src/app.js`
- Create: `scripts/build-mini-tool.mjs`
- Create: `tests/mini-tool-build.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `data/seed/index.ts` through `loadTypeScriptModule(entryPath)` and static source files in `mini-tool/src`.
- Produces: `output/xhs-mini-tool/dist`, including `index.html`, `assets/styles.css`, `assets/data.js`, and `assets/app.js`.
- Produces global data contract:

```ts
type MiniToolData = {
  meta: { title: "一卷山河"; description: "轻松逛懂五代十国"; minYear: 875; maxYear: 979 };
  dynasties: Array<{ id: string; name: string; category: string; startYear: number; endYear: number; summary: string; color: string }>;
  people: Array<{ id: string; name: string; aliases: string[]; dynastyIds: string[]; roles: string[]; summary: string; biography: string }>;
  events: Array<{ id: string; title: string; eventType: string; tracks: string[]; startYear: number; endYear?: number; summary: string; background: string; process: string; result: string; impact: string; personIds: string[]; dynastyIds: string[]; locationIds: string[]; sourceRefs: string[]; disputedNote: string }>;
  locations: Array<{ id: string; name: string; longitude: number; latitude: number; modernReference: string }>;
};
```

- [ ] **Step 1: Write the failing build contract tests**

```ts
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("mini-tool build", () => {
  it("emits a root entry and ordered classic scripts", () => {
    execFileSync(process.execPath, ["scripts/build-mini-tool.mjs"], { stdio: "pipe" });
    const dist = resolve("output/xhs-mini-tool/dist");
    const html = readFileSync(resolve(dist, "index.html"), "utf8");
    expect(existsSync(resolve(dist, "assets/data.js"))).toBe(true);
    expect(existsSync(resolve(dist, "assets/app.js"))).toBe(true);
    expect(html.indexOf("./assets/data.js")).toBeLessThan(html.indexOf("./assets/app.js"));
    expect(html).not.toMatch(/<script(?![^>]*src=)/i);
    expect(html).not.toContain('type="module"');
  });

  it("exports real repository records through the stable global contract", () => {
    const data = readFileSync(resolve("output/xhs-mini-tool/dist/assets/data.js"), "utf8");
    expect(data).toContain("window.__MINI_TOOL_DATA__=");
    expect(data).toContain('"id":"later-liang-founded"');
    expect(data).toContain('"id":"zhu-wen"');
    expect(data).toContain('"minYear":875');
    expect(data).toContain('"maxYear":979');
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail before the builder exists**

Run: `npm test -- --run tests/mini-tool-build.test.ts`

Expected: FAIL because `scripts/build-mini-tool.mjs` is missing.

- [ ] **Step 3: Add a minimal valid static shell**

Create `mini-tool/src/index.html` with this complete structural contract:

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>一卷山河</title>
    <link rel="stylesheet" href="./assets/styles.css">
  </head>
  <body>
    <a class="skip-link" href="#main">跳到主要内容</a>
    <header class="masthead"><p>875—979</p><h1>一卷山河</h1><p>轻松逛懂五代十国</p></header>
    <nav class="tabs" aria-label="主要内容"></nav>
    <main id="main" tabindex="-1"></main>
    <script src="./assets/data.js"></script>
    <script src="./assets/app.js"></script>
  </body>
</html>
```

Create `mini-tool/src/styles.css` with a Chrome 61-safe reset and visibility baseline; create `mini-tool/src/app.js` as a strict IIFE that replaces `#main` with a loading status when data is unavailable.

- [ ] **Step 4: Implement the local TypeScript module loader and reducer**

In `scripts/build-mini-tool.mjs`, implement these exact functions:

```js
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
```

After loading `seedData`, map only the fields declared by `MiniToolData`, sort events by `startYear` and `orderInYear`, serialize with `JSON.stringify`, and write `window.__MINI_TOOL_DATA__=<json>;` without Base64 content. Copy the HTML/CSS/JS sources to the exact `dist` paths, deleting only `output/xhs-mini-tool/dist` before rebuilding.

- [ ] **Step 5: Add package scripts and run the build tests**

Add:

```json
"mini-tool:build": "node scripts/build-mini-tool.mjs",
"mini-tool:test": "vitest run tests/mini-tool-*.test.ts"
```

Run: `npm run mini-tool:test`

Expected: PASS, with `output/xhs-mini-tool/dist/index.html` and all three asset files present.

- [ ] **Step 6: Commit the data build boundary**

```powershell
git add mini-tool/src scripts/build-mini-tool.mjs tests/mini-tool-build.test.ts package.json
git commit -m "feat: build offline mini tool data"
```

---

### Task 3: Implement the single-page exploration experience

**Files:**
- Modify: `mini-tool/src/index.html`
- Modify: `mini-tool/src/styles.css`
- Modify: `mini-tool/src/app.js`
- Create: `tests/mini-tool-ui.test.ts`

**Interfaces:**
- Consumes: `window.__MINI_TOOL_DATA__` from Task 2.
- Produces: `window.__MINI_TOOL_APP__.createApp(root, data)` for jsdom tests and five views named `guide`, `timeline`, `people`, `events`, and `atlas`.

- [ ] **Step 1: Write failing jsdom interaction tests**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function boot(data: unknown) {
  document.body.innerHTML = '<nav class="tabs"></nav><main id="main"></main>';
  window.eval(readFileSync(resolve("mini-tool/src/app.js"), "utf8"));
  return (window as unknown as { __MINI_TOOL_APP__: { createApp(root: HTMLElement, data: unknown): void } }).__MINI_TOOL_APP__;
}

it("filters timeline events by year and opens event detail", () => {
  const app = boot(fixtureData);
  app.createApp(document.querySelector("#main")!, fixtureData);
  document.querySelector<HTMLButtonElement>('[data-view="timeline"]')!.click();
  const year = document.querySelector<HTMLSelectElement>('[data-field="year"]')!;
  year.value = "907";
  year.dispatchEvent(new Event("change", { bubbles: true }));
  expect(document.body.textContent).toContain("后梁建立、唐亡");
  document.querySelector<HTMLButtonElement>('[data-event-id="later-liang-founded"]')!.click();
  expect(document.querySelector('[role="dialog"]')?.textContent).toContain("影响");
});

it("recovers from an empty people search", () => {
  const app = boot(fixtureData);
  app.createApp(document.querySelector("#main")!, fixtureData);
  document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
  const search = document.querySelector<HTMLInputElement>('[data-field="person-search"]')!;
  search.value = "不存在的人";
  search.dispatchEvent(new Event("input", { bubbles: true }));
  expect(document.querySelector('[role="status"]')?.textContent).toContain("没有找到");
  document.querySelector<HTMLButtonElement>('[data-action="clear-search"]')!.click();
  expect(document.body.textContent).toContain("朱温");
});
```

- [ ] **Step 2: Run the UI tests and verify the missing app contract fails**

Run: `npm test -- --run tests/mini-tool-ui.test.ts`

Expected: FAIL because `window.__MINI_TOOL_APP__.createApp` and the view controls are not implemented.

- [ ] **Step 3: Implement state and rendering without modern syntax**

Use this public shape in `mini-tool/src/app.js`:

```js
(function () {
  "use strict";
  function createApp(root, data) {
    var state = { view: "guide", year: 907, track: "all", personQuery: "", selectedEventId: "" };
    function setState(patch) {
      Object.keys(patch).forEach(function (key) { state[key] = patch[key]; });
      render();
    }
    function render() {
      renderTabs(state, setState);
      if (state.view === "timeline") renderTimeline(root, data, state, setState);
      else if (state.view === "people") renderPeople(root, data, state, setState);
      else if (state.view === "events") renderEvents(root, data, state, setState);
      else if (state.view === "atlas") renderAtlas(root, data, state, setState);
      else renderGuide(root, data, setState);
    }
    render();
  }
  window.__MINI_TOOL_APP__ = { createApp: createApp };
  if (window.__MINI_TOOL_DATA__) createApp(document.getElementById("main"), window.__MINI_TOOL_DATA__);
})();
```

Render all user-provided or dataset text through `textContent`, never by concatenating it into `innerHTML`. Create elements through small helpers `element(tagName, className, text)` and `button(label, attributes)`. Bind every interaction through `addEventListener`.

- [ ] **Step 4: Implement the five complete views and recovery states**

Implement the following behavior in the same classic script:

- `guide`: product scope, three reading-path buttons, content range, source/AI/map notices.
- `timeline`: year selector for 875–979, track selector, matching event cards, and a recoverable no-result status.
- `people`: local name/alias/role search, dynasty-category chips, person cards, and biography detail.
- `events`: event-type chips, chronological cards, and event detail dialog with background/process/result/impact/source labels.
- `atlas`: year selector, responsive SVG using local location coordinates and active dynasties, plus a semantically equivalent polity list and “示意，不代表精确疆界” notice.

The dialog close button and backdrop restore focus to the opener. `Escape` closes the dialog. View changes focus the `<h2>` using `tabindex="-1"` and update an `aria-live="polite"` status.

- [ ] **Step 5: Add the approved visual system with Chrome 61 fallbacks**

Use the existing palette (`#172824`, `#f3f0e7`, `#9f4036`, `#b79755`) with a lighter coral accent for touch controls. Use adjacent-child margins instead of Flex gap; physical padding properties instead of logical properties; `100vh` before any variable height enhancement; `:focus` before `:focus-visible`; and safe area rules:

```css
.app-shell { min-height: 100vh; min-height: var(--app-height, 100vh); }
.bottom-tabs {
  padding-bottom: 10px;
  padding-bottom: calc(10px + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));
}
.tab + .tab { margin-left: 6px; }
.tab:focus { outline: 2px solid #9f4036; outline-offset: 2px; }
@supports selector(:focus-visible) {
  .tab:focus:not(:focus-visible) { outline: none; }
}
```

- [ ] **Step 6: Run UI, build, and existing data tests**

Run:

```powershell
npm test -- --run tests/mini-tool-ui.test.ts tests/mini-tool-build.test.ts tests/history-data.test.ts tests/seed-immutability.test.ts
npm run mini-tool:build
```

Expected: all tests PASS and the rebuilt artifact renders all five views from real repository data.

- [ ] **Step 7: Commit the offline experience**

```powershell
git add mini-tool/src tests/mini-tool-ui.test.ts
git commit -m "feat: add offline history exploration experience"
```

---

### Task 4: Add artifact policy checks and deterministic ZIP packaging

**Files:**
- Create: `scripts/package-mini-tool.py`
- Create: `tests/mini-tool-compliance.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `output/xhs-mini-tool/dist` and the installed skill references.
- Produces: `output/xhs-mini-tool/一卷山河.zip` with `index.html` at the ZIP root.

- [ ] **Step 1: Write failing compliance and package tests**

```ts
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const forbidden = [
  /\bfetch\s*\(/, /XMLHttpRequest/, /new\s+Worker\s*\(/, /navigator\.clipboard/,
  /window\.open\s*\(/, /\beval\s*\(/, /new\s+Function\s*\(/, /WebAssembly\./,
  /<iframe\b/i, /<object\b/i, /target=["']_blank["']/i, /https?:\/\//i,
];

it("contains no restricted capability or external resource", () => {
  execFileSync(process.execPath, ["scripts/build-mini-tool.mjs"]);
  for (const file of listTextFiles(resolve("output/xhs-mini-tool/dist"))) {
    const text = readFileSync(file, "utf8");
    for (const pattern of forbidden) expect(text, `${file}: ${pattern}`).not.toMatch(pattern);
  }
});

it("keeps the unpacked artifact within the design target", () => {
  const bytes = directoryBytes(resolve("output/xhs-mini-tool/dist"));
  expect(bytes).toBeLessThan(2 * 1024 * 1024);
});
```

- [ ] **Step 2: Run the compliance test and verify packaging is missing**

Run: `npm test -- --run tests/mini-tool-compliance.test.ts`

Expected: the source scan may pass, but ZIP assertions fail because the packaging script and ZIP do not exist.

- [ ] **Step 3: Implement the Python standard-library packager**

```py
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "output" / "xhs-mini-tool" / "dist"
TARGET = ROOT / "output" / "xhs-mini-tool" / "一卷山河.zip"
ALLOWED = {".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".woff", ".woff2", ".json"}

files = sorted(path for path in DIST.rglob("*") if path.is_file())
if not files or DIST / "index.html" not in files:
    raise SystemExit("index.html must exist at the artifact root")
if any(path.suffix.lower() not in ALLOWED for path in files):
    raise SystemExit("artifact contains an unsupported file type")

TARGET.unlink(missing_ok=True)
with ZipFile(TARGET, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
    for path in files:
        archive.write(path, path.relative_to(DIST).as_posix())
if TARGET.stat().st_size > 10 * 1024 * 1024:
    raise SystemExit("ZIP exceeds 10 MiB")
print(TARGET)
```

- [ ] **Step 4: Extend tests to inspect the ZIP central directory**

Use `execFileSync` with the bundled workspace Python executable when available and fall back to `python`. Assert with `python -c` that the first-level names include `index.html`, no name starts with `dist/`, all suffixes are allowed, and archive size is below 2 MiB.

- [ ] **Step 5: Add package scripts and run the artifact audits**

Add:

```json
"mini-tool:package": "python scripts/package-mini-tool.py",
"mini-tool:audit": "python .codex/skills/minitool-zip-builder/scripts/audit_artifact.py output/xhs-mini-tool/dist && python .codex/skills/minitool-zip-builder/scripts/audit_artifact.py output/xhs-mini-tool/一卷山河.zip"
```

Run:

```powershell
npm run mini-tool:build
npm run mini-tool:package
npm run mini-tool:audit
npm test -- --run tests/mini-tool-compliance.test.ts
```

Expected: both skill audits report zero `ERROR`; compliance tests PASS; the ZIP is below 2 MiB.

- [ ] **Step 6: Commit policy enforcement and packaging**

```powershell
git add scripts/package-mini-tool.py tests/mini-tool-compliance.test.ts package.json
git commit -m "build: audit and package xiaohongshu mini tool"
```

---

### Task 5: Generate and validate the approved project icon

**Files:**
- Create: `mini-tool/src/assets/icon.png`
- Create: `tests/mini-tool-icon.test.ts`

**Interfaces:**
- Consumes: approved A1 “山河入城” design and the supplied reference image as a composition/finish reference only.
- Produces: `mini-tool/src/assets/icon.png`; Task 2 copies it to `output/xhs-mini-tool/dist/assets/icon.png`, and final delivery copies it to `output/xhs-mini-tool/icon.png`.

- [ ] **Step 1: Write the failing image contract test**

```ts
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

it("provides a square PNG icon below the upload limit", () => {
  const path = resolve("mini-tool/src/assets/icon.png");
  const bytes = readFileSync(path);
  expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(statSync(path).size).toBeLessThan(5 * 1024 * 1024);
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  expect(width).toBe(height);
  expect(width).toBeGreaterThanOrEqual(512);
});
```

- [ ] **Step 2: Run the test and verify the icon is absent**

Run: `npm test -- --run tests/mini-tool-icon.test.ts`

Expected: FAIL because `mini-tool/src/assets/icon.png` does not exist.

- [ ] **Step 3: Generate one icon with the built-in image tool**

Use this final prompt exactly once unless the image service itself returns a failed request:

```text
Use case: logo-brand
Asset type: square app icon for the Xiaohongshu mini-tool “一卷山河”
Primary request: create a distinctive central emblem of an elegant ancient Chinese city gate with a river flowing outward from its arch, expressing entering history and following the river of time
Input images: the user-supplied icon is a finish and composition reference only; do not copy its crescent or reflection motif
Scene/backdrop: warm ivory rounded-square icon tile
Subject: one simplified teal-green city gate and one flowing river, with a single small cinnabar-red sun/dot
Style/medium: refined soft paper-sculpture relief, subtle tactile depth, youthful digital-museum character
Composition/framing: centered, generous negative space, bold readable silhouette at 48 px, balanced 1:1 composition
Lighting/mood: soft museum-display lighting, calm, welcoming, polished
Color palette: warm ivory, mineral teal green, small cinnabar-red accent
Constraints: no text, no letters, no numbers, no logo, no watermark, no people, no crescent moon; keep the city gate and river concrete and immediately recognizable
```

Inspect the generated result for the required subject, square framing, lack of text/watermark, and recognizability at thumbnail size. Copy the selected built-in output into `mini-tool/src/assets/icon.png` without overwriting unrelated assets.

After the next successful build, run `Copy-Item -LiteralPath 'mini-tool/src/assets/icon.png' -Destination 'output/xhs-mini-tool/icon.png' -Force` so the upload icon is also available outside the ZIP.

- [ ] **Step 4: Run icon, build, and compliance tests**

Run:

```powershell
npm test -- --run tests/mini-tool-icon.test.ts tests/mini-tool-build.test.ts tests/mini-tool-compliance.test.ts
npm run mini-tool:build
```

Expected: all tests PASS and the copied artifact icon remains below 5 MiB.

- [ ] **Step 5: Commit the icon**

```powershell
git add mini-tool/src/assets/icon.png tests/mini-tool-icon.test.ts
git commit -m "feat: add city gate river icon"
```

---

### Task 6: Verify the complete deliverable and write the compliance summary

**Files:**
- Create: `mini-tool/README.md`
- Create: `output/xhs-mini-tool/validation-summary.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: all previous tasks, the attached operation-guide PDF, the official service agreement, and both skill audit targets.
- Produces: final upload ZIP, standalone icon, public metadata, and a human-readable validation summary.

- [ ] **Step 1: Document the source/build boundary**

In `mini-tool/README.md`, document the exact commands, generated paths, prohibited runtime assumptions, and the distinction between source (`mini-tool/src`) and generated output (`output/xhs-mini-tool`). Add a short root README section linking to that document and listing the name and description.

- [ ] **Step 2: Run the focused verification suite**

Run:

```powershell
npm run mini-tool:test
npm run mini-tool:build
npm run mini-tool:package
npm run mini-tool:audit
npm run typecheck
npm run lint
git diff --check
```

Expected: all commands exit 0; both audits have zero `ERROR`; no diff whitespace errors.

- [ ] **Step 3: Run the complete regression suite and production build**

Run:

```powershell
npm test -- --run
npm run build
```

Expected: all Vitest tests PASS and Next.js production build succeeds. If unrelated pre-existing failures occur, record exact commands and evidence instead of claiming success.

- [ ] **Step 4: Inspect the final ZIP and icon**

Run:

```powershell
tar -tf 'output/xhs-mini-tool/一卷山河.zip'
Get-Item 'output/xhs-mini-tool/一卷山河.zip','output/xhs-mini-tool/icon.png' | Select-Object FullName,Length
```

Expected: `index.html` is at ZIP root, only supported file extensions appear, ZIP is below 2 MiB, and icon is below 5 MiB.

- [ ] **Step 5: Perform browser QA from the unpacked artifact**

Serve `output/xhs-mini-tool/dist` over loopback and check desktop plus a 390×844 mobile viewport. Verify all five views, year and track filters, people search/clear, event dialog/Escape/focus restoration, source and accuracy notices, scrolling, long text, and absence of console errors. Record that this is modern-browser QA, not Chrome 61 or Xiaohongshu-container evidence.

- [ ] **Step 6: Write the final validation summary**

`output/xhs-mini-tool/validation-summary.md` must contain these headings and concrete results:

```markdown
# 一卷山河校验摘要
## 上架信息
## 产物结构与体积
## 自动检查结果
## 容器能力检查
## 《小工具服务协议》合规评估
## 内容、版权与来源说明
## 浏览器验证
## 未实测与剩余风险
## 产物路径
```

State explicitly that the tool makes no network request, collects no personal information, requests no sensitive permission, contains no ad or third-party embed, and does not use restricted APIs. Include the exact audit outputs and file sizes. Mark Chrome 61 compatibility, Xiaohongshu simulator/container behavior, and physical-device performance as untested unless corresponding evidence was actually obtained.

- [ ] **Step 7: Rebuild after documentation and commit tracked deliverables**

Run the focused verification suite once more, then:

```powershell
git add README.md mini-tool/README.md
git commit -m "docs: document xiaohongshu mini tool delivery"
```

Do not force-add ignored `output/`; deliver generated output by absolute path and leave source-controlled inputs reproducible.
