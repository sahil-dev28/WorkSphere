import { describe, expect, it } from "vitest";

import { buildCommandItems, filterCommandItems } from "./command-items";

const labels = (items: { label: string }[]) => items.map((item) => item.label);

describe("buildCommandItems", () => {
  it("gives employees only their own pages and personal actions", () => {
    const items = labels(buildCommandItems({ role: "employee" }));
    expect(items).toEqual(expect.arrayContaining(["Dashboard", "My Profile", "Toggle theme", "Change password", "Log out"]));
    expect(items).not.toContain("Add employee");
    expect(items).not.toContain("Organization");
  });

  it("gives admins every page and management actions", () => {
    const items = labels(buildCommandItems({ role: "super_admin" }));
    expect(items).toEqual(expect.arrayContaining(["Employees", "Organization", "Add employee", "Import CSV"]));
  });

  it("offers switching only to other demo roles", () => {
    const items = labels(
      buildCommandItems({ role: "hr_manager", demo: { current: "hr_manager", available: ["super_admin", "hr_manager"] } }),
    );
    expect(items).toContain("Switch to Super Admin");
    expect(items).not.toContain("Switch to HR Manager");
  });
});

describe("filterCommandItems", () => {
  it("matches labels and keywords case-insensitively", () => {
    const items = buildCommandItems({ role: "super_admin" });
    expect(labels(filterCommandItems(items, "PROF"))).toEqual(["My Profile"]);
    expect(labels(filterCommandItems(items, "dark"))).toEqual(["Toggle theme"]);
    expect(filterCommandItems(items, "")).toHaveLength(items.length);
  });
});
