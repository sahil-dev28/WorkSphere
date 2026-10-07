import { describe, expect, it } from "vitest";

import { siteUrl } from "./site-url";

describe("siteUrl", () => {
  it("prefers the configured site URL", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://worksphere.dev", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" }).href).toBe(
      "https://worksphere.dev/",
    );
  });

  it("falls back to the Vercel production domain", () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "worksphere.vercel.app" }).href).toBe("https://worksphere.vercel.app/");
  });

  it("falls back to localhost in development", () => {
    expect(siteUrl({}).href).toBe("http://localhost:3001/");
  });
});
