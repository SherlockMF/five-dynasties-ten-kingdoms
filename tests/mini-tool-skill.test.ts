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
