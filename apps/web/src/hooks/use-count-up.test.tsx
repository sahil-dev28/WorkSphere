import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useCountUp } from "./use-count-up";

function Probe({ target }: { target: number }) {
  const { ref, value } = useCountUp<HTMLSpanElement>(target);
  return (
    <span ref={ref} data-testid="n">
      {value}
    </span>
  );
}

let ioCallback: IntersectionObserverCallback | null = null;

class FakeIO {
  constructor(cb: IntersectionObserverCallback) {
    ioCallback = cb;
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

function stubMatchMedia(reduced: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: reduced && query.includes("reduce"),
      media: query,
      addEventListener() {},
      removeEventListener() {},
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  ioCallback = null;
});

describe("useCountUp", () => {
  it("shows the target immediately when reduced motion is preferred", () => {
    stubMatchMedia(true);
    vi.stubGlobal("IntersectionObserver", FakeIO);
    render(<Probe target={42} />);
    expect(screen.getByTestId("n")).toHaveTextContent("42");
  });

  it("shows the target immediately when IntersectionObserver is unavailable", () => {
    stubMatchMedia(false);
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Probe target={42} />);
    expect(screen.getByTestId("n")).toHaveTextContent("42");
  });

  it("counts from 0 to the target once visible", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    stubMatchMedia(false);
    vi.stubGlobal("IntersectionObserver", FakeIO);
    render(<Probe target={42} />);
    expect(screen.getByTestId("n")).toHaveTextContent("0");

    act(() => {
      ioCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId("n")).toHaveTextContent("42");
  });
});
