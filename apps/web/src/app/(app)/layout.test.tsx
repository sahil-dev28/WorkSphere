// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({ getMe: async () => null }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

describe("AppLayout", () => {
  it("routes an expired session through the cookie-clearing endpoint", async () => {
    const { default: AppLayout } = await import("./layout");
    await expect(AppLayout({ children: null })).rejects.toThrow("REDIRECT:/session-expired");
  }, 15_000);
});
