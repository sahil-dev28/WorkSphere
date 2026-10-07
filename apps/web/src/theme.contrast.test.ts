import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const css = readFileSync(path.join(__dirname, "index.css"), "utf8");

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`missing ${selector} block`);
  const body = css.slice(start, css.indexOf("}", start));
  const vars: Record<string, string> = {};
  for (const m of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    vars[m[1]] = m[2].toLowerCase();
  }
  return vars;
}

function rgb(hex: string) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function tint(fg: string, bg: string, alpha: number) {
  const f = rgb(fg);
  const b = rgb(bg);
  return `#${f.map((c, i) => Math.round(c * alpha + b[i] * (1 - alpha)).toString(16).padStart(2, "0")).join("")}`;
}

const SOLID_PAIRS: [string, string][] = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["foreground", "muted"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["muted-foreground", "muted"],
  ["primary-foreground", "primary"],
  ["sidebar-foreground", "sidebar"],
  ["sidebar-primary-foreground", "sidebar-primary"],
  ["sidebar-accent-foreground", "sidebar-accent"],
];

const TINT_TONES = ["primary", "destructive", "success", "warning", "chart-3"];

describe.each([
  ["light", ":root"],
  ["dark", ".dark"],
])("%s theme contrast", (_name, selector) => {
  const t = block(selector);

  it.each(SOLID_PAIRS)("%s on %s meets AA", (fg, bg) => {
    expect(t[fg], `--${fg}`).toBeDefined();
    expect(t[bg], `--${bg}`).toBeDefined();
    expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(TINT_TONES)("%s text on its 12 percent tint meets AA", (tone) => {
    expect(t[tone], `--${tone}`).toBeDefined();
    expect(ratio(t[tone], tint(t[tone], t.card, 0.12))).toBeGreaterThanOrEqual(4.5);
  });
});

// Tailwind palette values behind AVATAR_TONES (packages/ui/src/lib/avatar-tone.ts).
const AVATAR_TONES = [
  { name: "emerald", tint: "#10b981", light: "#047857", dark: "#6ee7b7" },
  { name: "sky", tint: "#0ea5e9", light: "#0369a1", dark: "#7dd3fc" },
  { name: "violet", tint: "#8b5cf6", light: "#6d28d9", dark: "#c4b5fd" },
  { name: "amber", tint: "#f59e0b", light: "#92400e", dark: "#fcd34d" },
  { name: "rose", tint: "#f43f5e", light: "#be123c", dark: "#fda4af" },
  { name: "teal", tint: "#14b8a6", light: "#0f766e", dark: "#5eead4" },
  { name: "indigo", tint: "#6366f1", light: "#4338ca", dark: "#a5b4fc" },
  { name: "fuchsia", tint: "#d946ef", light: "#a21caf", dark: "#f0abfc" },
];

describe("avatar tone contrast", () => {
  const light = block(":root");
  const dark = block(".dark");

  it.each(AVATAR_TONES)("$name initials stay readable in both themes", ({ tint: base, light: fgLight, dark: fgDark }) => {
    expect(ratio(fgLight, tint(base, light.card!, 0.15))).toBeGreaterThanOrEqual(4.5);
    expect(ratio(fgDark, tint(base, dark.card!, 0.15))).toBeGreaterThanOrEqual(4.5);
  });
});

it("disables motion utilities under prefers-reduced-motion", () => {
  const at = css.indexOf("@media (prefers-reduced-motion: reduce)");
  expect(at).toBeGreaterThan(-1);
  const reduced = css.slice(at);
  expect(reduced).toContain(".animate-in-up");
  expect(reduced).toContain(".shimmer");
  expect(reduced).toContain("::view-transition-new(*)");
  expect(reduced).toContain("[data-open]");
  expect(reduced).toContain("[data-closed]");
  expect(reduced).toContain("transition-duration: 0s");
});
