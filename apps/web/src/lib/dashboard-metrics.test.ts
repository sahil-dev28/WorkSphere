import { describe, expect, it } from "vitest";

import { joinedWithin, monthlyHeadcount, percent } from "./dashboard-metrics";

const now = new Date("2026-10-07T12:00:00Z");
const e = (joiningDate: string) => ({ joiningDate });

describe("joinedWithin", () => {
  it("counts joins in the last 30 days only", () => {
    const roster = [e("2026-10-01"), e("2026-09-10"), e("2026-08-01"), e("2026-12-01"), e("not-a-date")];
    expect(joinedWithin(roster, now)).toBe(2);
  });

  it("is zero for an empty roster", () => {
    expect(joinedWithin([], now)).toBe(0);
  });
});

describe("monthlyHeadcount", () => {
  it("returns a cumulative, non-decreasing 12-month series ending at the valid total", () => {
    const roster = [e("2020-01-01"), e("2026-01-15"), e("2026-06-01"), e("2026-10-02"), e("garbage")];
    const series = monthlyHeadcount(roster, now);
    expect(series).toHaveLength(12);
    expect(series[0]).toBe(1);
    expect(series.at(-1)).toBe(4);
    expect(series.every((v, i) => i === 0 || v >= series[i - 1]!)).toBe(true);
  });

  it("ignores employees joining after the current month", () => {
    expect(monthlyHeadcount([e("2027-02-01")], now).at(-1)).toBe(0);
  });
});

describe("percent", () => {
  it("rounds and guards against division by zero", () => {
    expect(percent(56, 60)).toBe(93);
    expect(percent(3, 0)).toBe(0);
  });
});
