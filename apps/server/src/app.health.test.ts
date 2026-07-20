import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "@/app";

describe("GET /api/health", () => {
  it("responds with 200 OK", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.text).toBe("OK");
  });
});
