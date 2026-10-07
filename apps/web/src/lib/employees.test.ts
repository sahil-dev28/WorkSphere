// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ serverFetch: vi.fn() }));
vi.mock("@/lib/api", () => ({ serverFetch: mocks.serverFetch }));

import { getEmployeeRosterResult } from "./employees";

afterEach(() => mocks.serverFetch.mockReset());

describe("getEmployeeRosterResult", () => {
  it("distinguishes a failed load from an empty organization", async () => {
    mocks.serverFetch.mockResolvedValueOnce(new Response("{}", { status: 500 }));
    await expect(getEmployeeRosterResult()).resolves.toEqual({ ok: false, data: [] });

    mocks.serverFetch.mockRejectedValueOnce(new TypeError("fetch failed"));
    await expect(getEmployeeRosterResult()).resolves.toEqual({ ok: false, data: [] });

    mocks.serverFetch.mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    await expect(getEmployeeRosterResult()).resolves.toEqual({ ok: true, data: [] });
  });
});
