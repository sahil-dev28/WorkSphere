// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { config, proxy } from "./proxy";

function request(path: string, session = false) {
  return new NextRequest(`http://localhost:3001${path}`, {
    headers: session ? { cookie: "token=abc" } : {},
  });
}

describe("proxy", () => {
  it("lets anonymous visitors see the login screen at the root", () => {
    expect(proxy(request("/")).headers.get("x-middleware-next")).toBe("1");
  });

  it("sends signed-in visitors on the root to the dashboard", () => {
    expect(proxy(request("/", true)).headers.get("location")).toBe("http://localhost:3001/dashboard");
  });

  it("still sends anonymous visitors on app routes to login", () => {
    expect(proxy(request("/dashboard")).headers.get("location")).toBe("http://localhost:3001/login");
  });

  it("still sends signed-in visitors on /login to the dashboard", () => {
    expect(proxy(request("/login", true)).headers.get("location")).toBe("http://localhost:3001/dashboard");
  });

  it("does not run on static assets", () => {
    const matcher = new RegExp(`^${config.matcher[0]}$`);
    expect(matcher.test("/landing/og.png")).toBe(false);
    expect(matcher.test("/employee-import-template.csv")).toBe(false);
    expect(matcher.test("/dashboard")).toBe(true);
    expect(matcher.test("/")).toBe(true);
  });
});
