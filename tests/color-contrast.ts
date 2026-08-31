import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export type Rgb = [number, number, number];

export function getThemeColor(name: string): Rgb {
  const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
  const value = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
  if (!value) throw new Error(`Missing theme color: ${name}`);
  return [1, 3, 5].map((index) =>
    Number.parseInt(value.slice(index, index + 2), 16),
  ) as Rgb;
}

export function blend(
  foreground: Rgb,
  background: Rgb,
  alpha: number,
): Rgb {
  return foreground.map((channel, index) =>
    Math.round(channel * alpha + background[index] * (1 - alpha)),
  ) as Rgb;
}

export function contrastRatio(foreground: Rgb, background: Rgb) {
  const luminance = (rgb: Rgb) => {
    const [red, green, blue] = rgb.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

export const WHITE: Rgb = [255, 255, 255];
