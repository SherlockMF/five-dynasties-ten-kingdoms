import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const manifest = JSON.parse(readFileSync(new URL("../docs/archive/li-jingxun-source-manifest.json", import.meta.url), "utf8"));
const current = execFileSync("rg", ["--files", "--hidden", "-g", "!.git", "-g", "!node_modules", "-g", "!.next", "-g", "!.netlify"], { cwd: manifest.source, encoding: "utf8" }).trim().split(/\r?\n/).sort();
const expected = manifest.files.map(file => file.path);
if (JSON.stringify(current) !== JSON.stringify(expected)) throw new Error("只读参考源文件清单发生变化。");
for (const file of manifest.files) {
  const hash = createHash("sha256").update(readFileSync(resolve(manifest.source, file.path))).digest("hex");
  if (hash !== file.sha256) throw new Error(`只读参考源内容发生变化：${file.path}`);
}
console.log(`只读参考源校验通过：${current.length} 个文件，SHA-256 均未变化。`);
