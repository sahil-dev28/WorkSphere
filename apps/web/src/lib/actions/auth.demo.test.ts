// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieSet: vi.fn(),
  cookieDelete: vi.fn(),
  serverFetch: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ set: mocks.cookieSet, get: vi.fn(), delete: mocks.cookieDelete }),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/api", () => ({ serverFetch: mocks.serverFetch }));

const UNAVAILABLE = "This demo account isn't available right now.";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function load() {
  vi.resetModules();
  return import("./auth");
}

beforeEach(() => {
  vi.stubEnv("DEMO_ADMIN_EMAIL", "admin@worksphere.dev");
  vi.stubEnv("DEMO_ADMIN_PASSWORD", "secret");
  vi.stubEnv("DEMO_HR_EMAIL", "");
  vi.stubEnv("DEMO_HR_PASSWORD", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  mocks.serverFetch.mockReset();
  mocks.redirect.mockClear();
});

describe("demoLoginAction", () => {
  it("rejects an unknown role without calling the API", async () => {
    const { demoLoginAction } = await load();
    await expect(demoLoginAction("root")).resolves.toEqual({ error: "Unknown demo role" });
    expect(mocks.serverFetch).not.toHaveBeenCalled();
  });

  it("reports an unconfigured role as unavailable", async () => {
    const { demoLoginAction } = await load();
    await expect(demoLoginAction("hr_manager")).resolves.toEqual({ error: UNAVAILABLE });
    expect(mocks.serverFetch).not.toHaveBeenCalled();
  });

  it("reports a rejected login as unavailable", async () => {
    mocks.serverFetch.mockResolvedValue(json(401, { error: "Invalid credentials" }));
    const { demoLoginAction } = await load();
    await expect(demoLoginAction("super_admin")).resolves.toEqual({ error: UNAVAILABLE });
  });

  it("reports an unreachable API as unavailable", async () => {
    mocks.serverFetch.mockRejectedValue(new TypeError("fetch failed"));
    const { demoLoginAction } = await load();
    await expect(demoLoginAction("super_admin")).resolves.toEqual({ error: UNAVAILABLE });
  });

  it("signs in with the configured credentials and redirects to the dashboard", async () => {
    mocks.serverFetch.mockResolvedValue(json(200, { data: { mustChangePassword: false } }));
    const { demoLoginAction } = await load();
    await expect(demoLoginAction("super_admin")).rejects.toThrow("REDIRECT:/dashboard");
    const [path, init] = mocks.serverFetch.mock.calls[0] as [string, RequestInit];
    expect(path).toBe("/api/auth/login");
    expect(JSON.parse(String(init.body))).toEqual({ email: "admin@worksphere.dev", password: "secret" });
  });

  it("leaves the current session untouched when the target demo account fails", async () => {
    mocks.serverFetch.mockResolvedValue(json(401, { error: "Invalid credentials" }));
    const { demoLoginAction } = await load();
    await demoLoginAction("super_admin");
    expect(mocks.cookieSet).not.toHaveBeenCalled();
    expect(mocks.cookieDelete).not.toHaveBeenCalled();
  });

  it("sends accounts that must change password to the change-password page", async () => {
    mocks.serverFetch.mockResolvedValue(json(200, { data: { mustChangePassword: true } }));
    const { demoLoginAction } = await load();
    await expect(demoLoginAction("super_admin")).rejects.toThrow("REDIRECT:/change-password");
  });
});

describe("loginAction", () => {
  it("returns a friendly error when the API is unreachable", async () => {
    mocks.serverFetch.mockRejectedValue(new TypeError("fetch failed"));
    const { loginAction } = await load();
    const form = new FormData();
    form.set("email", "a@b.dev");
    form.set("password", "x");
    await expect(loginAction({}, form)).resolves.toEqual({
      error: "Couldn't reach the server. Try again shortly.",
    });
  });
});
