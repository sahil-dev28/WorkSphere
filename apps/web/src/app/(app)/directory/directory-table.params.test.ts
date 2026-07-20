import { describe, expect, it } from "vitest";

import { toDirectoryParams } from "./directory-table";

describe("toDirectoryParams", () => {
  it("omits keys that are absent or empty", () => {
    const params = toDirectoryParams(new URLSearchParams("department=Engineering"));
    expect(params).toEqual({ department: "Engineering" });
  });

  it("reads every recognized key", () => {
    const search = new URLSearchParams(
      "q=alice&department=Engineering&role=employee&status=active&sort=name_desc&page=2&action=edit&employeeId=abc123",
    );
    expect(toDirectoryParams(search)).toEqual({
      q: "alice",
      department: "Engineering",
      role: "employee",
      status: "active",
      sort: "name_desc",
      page: "2",
      action: "edit",
      employeeId: "abc123",
    });
  });
});
