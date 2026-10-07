// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /session-expired", () => {
  it("clears the session cookie and sends the visitor to login", async () => {
    const res = await GET(
      new NextRequest("http://localhost:3001/session-expired", { headers: { cookie: "token=stale" } }),
    );
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3001/login");
    expect(res.headers.get("set-cookie")).toMatch(/^token=;.*(Max-Age=0|Expires=Thu, 01 Jan 1970)/);
  });
});
