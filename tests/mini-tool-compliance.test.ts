import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { extname, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const projectRoot = resolve(".");
const testOutputRoot = resolve(projectRoot, "output");
mkdirSync(testOutputRoot, { recursive: true });
const workspace = mkdtempSync(resolve(testOutputRoot, "mini-tool-compliance-"));
const dist = resolve(workspace, "output/xhs-mini-tool/dist");
const archive = resolve(workspace, "output/xhs-mini-tool/一卷山河.zip");
const buildScript = resolve(workspace, "scripts/build-mini-tool.mjs");
const packageScript = resolve(workspace, "scripts/package-mini-tool.py");
let distExistedBeforeBuild = true;
const allowed = new Set([
  ".html",
  ".css",
  ".js",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".woff",
  ".woff2",
  ".json",
]);
const forbidden = [
  /\bfetch\s*\(/,
  /XMLHttpRequest/,
  /new\s+(?:Shared)?Worker\s*\(/,
  /new\s+WebSocket\s*\(/,
  /new\s+EventSource\s*\(/,
  /new\s+RTCPeerConnection\s*\(/,
  /navigator\.(?:clipboard|geolocation|bluetooth|usb|hid|serial|getBattery|connection|credentials|locks)/,
  /navigator\.mediaDevices\.(?:enumerateDevices|getDisplayMedia)/,
  /navigator\.storage\.persist/,
  /navigator\.serviceWorker\.register/,
  /new\s+(?:Accelerometer|Gyroscope|Magnetometer)\s*\(/,
  /Device(?:Motion|Orientation)Event/,
  /(?:webkit)?requestFullscreen\s*\(/,
  /window\.open\s*\(/,
  /window\.prompt\s*\(/,
  /\beval\s*\(/,
  /new\s+Function\s*\(/,
  /WebAssembly\./,
  /javascript:/i,
  /<script\b(?![^>]*\bsrc=)[^>]*>/i,
  /\bon[a-z]+\s*=/i,
  /<base\b/i,
  /<iframe\b/i,
  /<object\b/i,
  /<a\b[^>]*\bdownload\b/i,
  /target=["']_blank["']/i,
  /\b(?:location\.href\s*=|location\.assign\s*\()/,
  /https?:\/\//i,
];

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function listTextFiles(directory: string): string[] {
  return listFiles(directory).filter((file) =>
    [".html", ".css", ".js", ".json", ".svg"].includes(extname(file).toLowerCase()),
  );
}

function directoryBytes(directory: string): number {
  return listFiles(directory).reduce((total, file) => total + statSync(file).size, 0);
}

function pythonExecutable(): string {
  const bundled = resolve(
    homedir(),
    ".cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe",
  );
  return existsSync(bundled) ? bundled : "python";
}

function packageArtifact(): Buffer {
  execFileSync(pythonExecutable(), [packageScript], { stdio: "pipe" });
  return readFileSync(archive);
}

describe("mini-tool artifact compliance", () => {
  beforeAll(() => {
    cpSync(resolve(projectRoot, "mini-tool/src"), resolve(workspace, "mini-tool/src"), {
      recursive: true,
    });
    cpSync(resolve(projectRoot, "data/seed"), resolve(workspace, "data/seed"), {
      recursive: true,
    });
    cpSync(resolve(projectRoot, "lib/deep-freeze.ts"), resolve(workspace, "lib/deep-freeze.ts"));
    cpSync(resolve(projectRoot, "scripts/build-mini-tool.mjs"), buildScript);
    cpSync(resolve(projectRoot, "scripts/package-mini-tool.py"), packageScript);
    cpSync(resolve(projectRoot, "package.json"), resolve(workspace, "package.json"));
    distExistedBeforeBuild = existsSync(dist);
    execFileSync(process.execPath, [buildScript], { cwd: workspace, stdio: "pipe" });
  });

  afterAll(() => {
    rmSync(workspace, { recursive: true, force: true });
  });

  it("builds its own artifact without relying on repository output", () => {
    expect(distExistedBeforeBuild).toBe(false);
    expect(existsSync(resolve(dist, "index.html"))).toBe(true);
  });

  it("contains no restricted capability or external resource", () => {
    for (const file of listTextFiles(dist)) {
      const text = readFileSync(file, "utf8");
      for (const pattern of forbidden) {
        expect(text, `${file}: ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("contains only supported files and stays within the unpacked design target", () => {
    const files = listFiles(dist);
    expect(existsSync(resolve(dist, "index.html"))).toBe(true);
    expect(files.every((file) => allowed.has(extname(file).toLowerCase()))).toBe(true);
    expect(directoryBytes(dist)).toBeLessThan(2 * 1024 * 1024);
  });

  it("packages a deterministic ZIP with index.html at the archive root", () => {
    const first = packageArtifact();
    const second = packageArtifact();
    expect(second.equals(first)).toBe(true);
    expect(second.byteLength).toBeLessThan(2 * 1024 * 1024);

    const inspect = [
      "import json, pathlib, zipfile",
      "path = pathlib.Path(r'" + archive.replaceAll("'", "''") + "')",
      "with zipfile.ZipFile(path) as z:",
      " print(json.dumps(z.namelist()))",
    ].join("\n");
    const names = JSON.parse(
      execFileSync(pythonExecutable(), ["-c", inspect], { encoding: "utf8" }),
    ) as string[];

    expect(names).toContain("index.html");
    expect(names.some((name) => name.startsWith("dist/"))).toBe(false);
    expect(names.every((name) => allowed.has(extname(name).toLowerCase()))).toBe(true);
  });

  it.each(["extra.html", "assets/help.html"])(
    "rejects an additional HTML file anywhere in the artifact: %s",
    (relativePath) => {
      const extraHtml = resolve(dist, relativePath);
      mkdirSync(resolve(extraHtml, ".."), { recursive: true });
      writeFileSync(extraHtml, "<!DOCTYPE html><title>extra</title>", "utf8");
      try {
        expect(() => packageArtifact()).toThrow(/exactly one HTML file/i);
      } finally {
        unlinkSync(extraHtml);
      }
    },
  );

  it("exposes a working npm packaging command on the current platform", () => {
    if (existsSync(archive)) unlinkSync(archive);
    const npmCli = process.env.npm_execpath;
    expect(npmCli).toBeTruthy();
    execFileSync(process.execPath, [npmCli!, "run", "mini-tool:package"], {
      cwd: workspace,
      stdio: "pipe",
    });
    expect(existsSync(archive)).toBe(true);
  });
});
