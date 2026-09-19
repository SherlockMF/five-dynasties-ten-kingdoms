import type { FieldConfig } from "@/types/field";

export function getFieldConfig(input: { nodeEnv?: string; mode?: string; playerUrl?: string; allowedOrigins?: string }): FieldConfig {
  const requested = input.mode || (input.nodeEnv === "development" ? "mock" : "disabled");
  const mode = requested === "mock" ? "mock" : requested === "webgl" && input.playerUrl ? "webgl" : "disabled";
  const allowedOrigins = (input.allowedOrigins ?? "").split(",").map((value) => value.trim()).filter((value) => {
    try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && url.origin === value; }
    catch { return false; }
  });
  return { mode, playerUrl: mode === "mock" ? "/field/mock/li-jingxun" : input.playerUrl ?? "", allowedOrigins };
}

export function resolveFieldPlayer(config: FieldConfig, parentOrigin: string): { url: string; origin: string } | null {
  if (config.mode === "disabled" || !config.playerUrl) return null;
  try {
    const url = new URL(config.playerUrl, parentOrigin);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    if (url.origin !== parentOrigin && !config.allowedOrigins.includes(url.origin)) return null;
    if (parentOrigin.startsWith("https:") && url.protocol !== "https:") return null;
    return { url: url.href, origin: url.origin };
  } catch { return null; }
}
