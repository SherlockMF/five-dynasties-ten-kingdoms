import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [id, source] = process.argv.slice(2);
const researchDir = "docs/research/portraits/series";
const jobs = JSON.parse(fs.readFileSync(`${researchDir}/jobs.json`, "utf8"));
const job = jobs.find((item) => item.id === id);
if (!job || !source) throw new Error("Expected known person ID and generated image path");
const output = `public/portraits/series/${id}.webp`;
if (fs.existsSync(output)) throw new Error(`Refusing to overwrite ${output}`);
fs.mkdirSync(path.dirname(output), { recursive: true });
const original = await sharp(source).metadata();
if (!original.width || !original.height) throw new Error("Invalid generated image");
await sharp(source).webp({ quality: 88 }).toFile(output);
const result = await sharp(output).metadata();
if (result.width !== original.width || result.height !== original.height) {
  throw new Error("Image dimensions changed during encoding");
}
fs.mkdirSync(`${researchDir}/generated`, { recursive: true });
const record = { ...job, generator: "built-in image_gen", original: source, asset: output, width: result.width, height: result.height };
fs.writeFileSync(`${researchDir}/generated/${id}.json`, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx" });
const portraits = {};
for (const file of fs.readdirSync(`${researchDir}/generated`).sort()) {
  const item = JSON.parse(fs.readFileSync(`${researchDir}/generated/${file}`, "utf8"));
  portraits[item.id] = {
    src: `/${item.asset.replace(/^public\//, "")}`,
    width: item.width,
    height: item.height,
    kind: item.reference ? "referenced" : "imagined",
    ...(item.reference ? { source: item.source } : {}),
    note: item.note,
  };
}
const type = 'export type PersonPortraitData = {\n  src: string;\n  width: number;\n  height: number;\n  note: string;\n} & (\n  | { kind: "referenced"; source: { title: string; url: string } }\n  | { kind: "imagined" }\n);\n\n';
fs.writeFileSync("data/portraits.ts", `${type}export const portraits: Record<string, PersonPortraitData> = ${JSON.stringify(portraits, null, 2)};\n`);
console.log(JSON.stringify({ id, output, width: result.width, height: result.height, bytes: fs.statSync(output).size, completed: Object.keys(portraits).length }));
