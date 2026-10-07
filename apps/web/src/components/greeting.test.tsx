import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Greeting, greetingFor } from "./greeting";

afterEach(() => vi.useRealTimers());

describe("greetingFor", () => {
  it.each([
    [5, "Good morning"],
    [11, "Good morning"],
    [12, "Good afternoon"],
    [16, "Good afternoon"],
    [17, "Good evening"],
    [0, "Good evening"],
    [4, "Good evening"],
  ])("hour %i → %s", (hour, expected) => {
    expect(greetingFor(hour)).toBe(expected);
  });
});

describe("Greeting", () => {
  it("greets by first name using the visitor's clock", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 7, 9, 0));
    render(<Greeting name="Priya Sharma" />);
    expect(await screen.findByText("Good morning, Priya")).toBeInTheDocument();
  });
});
