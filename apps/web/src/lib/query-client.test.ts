import { describe, expect, it } from "vitest";

import { getQueryClient } from "./query-client";

describe("getQueryClient", () => {
  it("returns the same instance on repeated calls (browser singleton)", () => {
    const first = getQueryClient();
    const second = getQueryClient();
    expect(first).toBe(second);
  });
});
