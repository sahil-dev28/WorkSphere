import type { CSSProperties } from "react";

export function stagger(i: number): CSSProperties {
  return { "--i": i } as CSSProperties;
}
