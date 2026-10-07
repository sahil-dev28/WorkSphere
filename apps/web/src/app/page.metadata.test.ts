// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: async () => ({ has: () => false }) }));

describe("landing metadata", () => {
  it("has a descriptive title and a large link-preview image", async () => {
    const { metadata } = await import("./page");
    expect(metadata.title).toBe("WorkSphere — Employee management, organized");
    expect(JSON.stringify(metadata.openGraph)).toContain("/landing/og.png");
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
