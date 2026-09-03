import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const maplibreRoot = dirname(require.resolve("maplibre-gl/package.json"));
const outputDirectory = fileURLToPath(
  new URL("../public/maplibre/", import.meta.url),
);
const workerFiles = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

await mkdir(outputDirectory, { recursive: true });
await Promise.all(
  workerFiles.map((fileName) =>
    copyFile(
      join(maplibreRoot, "dist", fileName),
      join(outputDirectory, fileName),
    ),
  ),
);

console.log(`Copied MapLibre worker assets to ${outputDirectory}`);
