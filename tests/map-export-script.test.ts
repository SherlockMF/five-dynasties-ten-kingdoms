import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const repositoryRoot = resolve(".");
const scriptPath = resolve("scripts/maps/export-snapshot.ps1");
const temporaryDirectories: string[] = [];

const runExporter = (arguments_: string[]): string => {
  try {
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        scriptPath,
        ...arguments_,
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        stdio: "pipe",
      },
    );
  } catch (error) {
    const result = error as { stderr?: string; stdout?: string };
    return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  }

  throw new Error("Expected the exporter to reject the invalid invocation");
};

const makeTemporaryDirectory = (): string => {
  const directory = mkdtempSync(join(tmpdir(), "wudai-map-export-"));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("generic atlas snapshot exporter", () => {
  it("declares reusable snapshot parameters and derives the one-year interval", () => {
    const script = readFileSync(scriptPath, "utf8");

    expect(script).toMatch(/\[ValidateRange\(907,\s*979\)\]\s*\[int\]\$Year/);
    expect(script).toMatch(/\[string\]\$GeoPackagePath/);
    expect(script).toMatch(/\[string\]\$SourceLedgerPath/);
    expect(script).toMatch(/\[string\]\$OutputRoot/);
    expect(script).toMatch(/\$validToYearExclusive\s*=\s*\$Year\s*\+\s*1/);
    expect(script).toContain("validFromYear <> $Year");
    expect(script).toContain(
      "validToYearExclusive <> $validToYearExclusive",
    );
    expect(script).toContain("year <> $Year");
    expect(script).toContain("$manifest.id -ne \"snapshot-$yearText\"");
    expect(script).toContain("$manifest.anchorYear -ne $Year");
    expect(script).toContain("$manifest.sourceRefs");
    expect(script).toContain("$manifest.inferenceNotes");
    expect(script).toContain("$manifest.confidence");
    expect(script).not.toContain("temporalBasis");
  });

  it("rejects a year outside the supported 907-979 range before touching GIS tools", () => {
    const temporaryDirectory = makeTemporaryDirectory();
    const output = runExporter([
      "-Year",
      "906",
      "-GeoPackagePath",
      join(temporaryDirectory, "outside.gpkg"),
      "-SourceLedgerPath",
      join(temporaryDirectory, "sources.json"),
      "-OutputRoot",
      temporaryDirectory,
    ]);

    expect(output).toMatch(/minimum allowed range of 907|ValidateRange/i);
  });

  it("rejects an editable package outside gis/<year>", () => {
    const temporaryDirectory = makeTemporaryDirectory();
    const packagePath = join(temporaryDirectory, "outside.gpkg");
    const sourceLedgerPath = join(temporaryDirectory, "sources.json");
    writeFileSync(packagePath, "not a real geopackage");
    writeFileSync(sourceLedgerPath, "[]");

    const output = runExporter([
      "-Year",
      "943",
      "-GeoPackagePath",
      packagePath,
      "-SourceLedgerPath",
      sourceLedgerPath,
      "-OutputRoot",
      temporaryDirectory,
    ]);

    expect(output).toContain("GeoPackage input must remain inside gis/943");
  });

  it("rejects an output root that overlaps the editable GIS directory", () => {
    const output = runExporter([
      "-Year",
      "943",
      "-GeoPackagePath",
      resolve("gis/943/wudai-943.gpkg"),
      "-SourceLedgerPath",
      resolve("gis/943/sources.json"),
      "-OutputRoot",
      resolve("gis/943"),
    ]);

    expect(output).toContain("Output root must remain inside public/maps");
  });

  it("rejects an output root outside repository public/maps", () => {
    const temporaryDirectory = makeTemporaryDirectory();
    const output = runExporter([
      "-Year",
      "943",
      "-GeoPackagePath",
      resolve("gis/943/wudai-943.gpkg"),
      "-SourceLedgerPath",
      resolve("gis/943/sources.json"),
      "-OutputRoot",
      temporaryDirectory,
    ]);

    expect(output).toContain("Output root must remain inside public/maps");
  });

  it("keeps the generic and 943 npm commands backward compatible", () => {
    const packageJson = JSON.parse(
      readFileSync(resolve("package.json"), "utf8"),
    ) as { scripts: Record<string, string> };

    expect(packageJson.scripts["maps:export"]).toContain(
      "scripts/maps/export-snapshot.ps1",
    );
    expect(packageJson.scripts["maps:export:943"]).toContain(
      "scripts/maps/export-943.ps1",
    );
  });
});
