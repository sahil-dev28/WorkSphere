import { describe, expect, it } from "vitest";

import { formatDate, initials } from "./format";

describe("initials", () => {
  it("takes the first letter of the first two words, uppercased", () => {
    expect(initials("Alice Cooper")).toBe("AC");
  });
});

describe("formatDate", () => {
  it("returns an em dash for a missing date", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("formats a valid date as Month Day, Year", () => {
    expect(formatDate("2026-01-15")).toBe("Jan 15, 2026");
  });
});
