import { describe, expect, it } from "vitest";

import { buildEmployeesQuery } from "./employees";

describe("buildEmployeesQuery", () => {
  it("always includes limit, omits absent optional params", () => {
    const qs = buildEmployeesQuery({ limit: 10 });
    expect(qs).toBe("limit=10");
  });

  it("includes every provided param", () => {
    const qs = buildEmployeesQuery({
      q: "alice",
      department: "Engineering",
      role: "employee",
      status: "active",
      sort: "name_desc",
      page: "2",
      limit: 25,
    });
    const params = new URLSearchParams(qs);
    expect(params.get("q")).toBe("alice");
    expect(params.get("department")).toBe("Engineering");
    expect(params.get("role")).toBe("employee");
    expect(params.get("status")).toBe("active");
    expect(params.get("sort")).toBe("name_desc");
    expect(params.get("page")).toBe("2");
    expect(params.get("limit")).toBe("25");
  });
});
