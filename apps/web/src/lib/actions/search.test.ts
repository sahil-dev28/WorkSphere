// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ serverFetch: vi.fn() }));
vi.mock("@/lib/api", () => ({ serverFetch: mocks.serverFetch }));

import { searchPeopleAction } from "./search";

afterEach(() => mocks.serverFetch.mockReset());

describe("searchPeopleAction", () => {
  it("skips the API for queries shorter than two characters", async () => {
    await expect(searchPeopleAction(" a ")).resolves.toEqual([]);
    expect(mocks.serverFetch).not.toHaveBeenCalled();
  });

  it("maps matching employees", async () => {
    mocks.serverFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ _id: "1", name: "Alice Cooper", designation: "Engineer", department: "Engineering" }],
          total: 1,
        }),
        { status: 200 },
      ),
    );
    await expect(searchPeopleAction("ali")).resolves.toEqual([
      { id: "1", name: "Alice Cooper", designation: "Engineer", department: "Engineering" },
    ]);
    expect(mocks.serverFetch.mock.calls[0]?.[0]).toBe("/api/employees?q=ali&limit=6&page=1");
  });

  it("returns nothing when the API refuses or fails", async () => {
    mocks.serverFetch.mockResolvedValueOnce(new Response("{}", { status: 403 }));
    await expect(searchPeopleAction("ali")).resolves.toEqual([]);
    mocks.serverFetch.mockRejectedValueOnce(new TypeError("fetch failed"));
    await expect(searchPeopleAction("ali")).resolves.toEqual([]);
  });
});
