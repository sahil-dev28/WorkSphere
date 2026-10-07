// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

async function load() {
  vi.resetModules();
  return import("./demo-credentials");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("demo credentials", () => {
  it("treats a role as configured only when email and password are both set", async () => {
    vi.stubEnv("DEMO_ADMIN_EMAIL", "admin@worksphere.dev");
    vi.stubEnv("DEMO_ADMIN_PASSWORD", "secret");
    vi.stubEnv("DEMO_HR_EMAIL", "hr@worksphere.dev");
    const { demoCredentials, configuredDemoRoles } = await load();
    expect(demoCredentials("super_admin")).toEqual({ email: "admin@worksphere.dev", password: "secret" });
    expect(demoCredentials("hr_manager")).toBeNull();
    expect(configuredDemoRoles()).toEqual(["super_admin"]);
  });

  it("treats empty strings as unset", async () => {
    vi.stubEnv("DEMO_EMPLOYEE_EMAIL", "");
    vi.stubEnv("DEMO_EMPLOYEE_PASSWORD", "");
    const { demoCredentials } = await load();
    expect(demoCredentials("employee")).toBeNull();
  });

  it("returns configured roles in admin, hr, employee order", async () => {
    vi.stubEnv("DEMO_EMPLOYEE_EMAIL", "e@worksphere.dev");
    vi.stubEnv("DEMO_EMPLOYEE_PASSWORD", "p");
    vi.stubEnv("DEMO_ADMIN_EMAIL", "a@worksphere.dev");
    vi.stubEnv("DEMO_ADMIN_PASSWORD", "p");
    vi.stubEnv("DEMO_HR_EMAIL", "h@worksphere.dev");
    vi.stubEnv("DEMO_HR_PASSWORD", "p");
    const { configuredDemoRoles } = await load();
    expect(configuredDemoRoles()).toEqual(["super_admin", "hr_manager", "employee"]);
  });
});

describe("demoRoleForEmail", () => {
  it("matches configured demo accounts case-insensitively", async () => {
    vi.stubEnv("DEMO_HR_EMAIL", "hr@worksphere.dev");
    vi.stubEnv("DEMO_HR_PASSWORD", "p");
    const { demoRoleForEmail } = await load();
    expect(demoRoleForEmail("HR@WorkSphere.dev")).toBe("hr_manager");
    expect(demoRoleForEmail("someone@else.dev")).toBeNull();
  });
});

describe("isDemoRole", () => {
  it("accepts only known roles", async () => {
    const { isDemoRole } = await import("./demo-roles");
    expect(isDemoRole("hr_manager")).toBe(true);
    expect(isDemoRole("root")).toBe(false);
    expect(isDemoRole(undefined)).toBe(false);
  });
});
