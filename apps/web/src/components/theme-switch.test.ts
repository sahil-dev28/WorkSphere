import { afterEach, describe, expect, it, vi } from "vitest";

import { switchTheme } from "./theme-switch";

function stubMatchMedia({ reduced = false, dark = false } = {}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: (query.includes("reduce") && reduced) || (query.includes("dark") && dark),
      media: query,
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
  Reflect.deleteProperty(document, "startViewTransition");
});

describe("switchTheme", () => {
  it("applies the theme directly when View Transitions are unsupported", () => {
    stubMatchMedia();
    const apply = vi.fn();
    switchTheme("dark", { x: 10, y: 10 }, apply);
    expect(apply).toHaveBeenCalledWith("dark");
    expect(document.documentElement).not.toHaveClass("theme-reveal");
  });

  it("applies directly under reduced motion even if supported", () => {
    stubMatchMedia({ reduced: true });
    const start = vi.fn();
    Object.assign(document, { startViewTransition: start });
    const apply = vi.fn();
    switchTheme("light", { x: 0, y: 0 }, apply);
    expect(apply).toHaveBeenCalledWith("light");
    expect(start).not.toHaveBeenCalled();
  });

  it("runs a reveal from the origin and toggles the dark class inside the transition", async () => {
    stubMatchMedia();
    let finish: () => void = () => {};
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    Object.assign(document, {
      startViewTransition: (cb: () => void) => {
        cb();
        return { finished };
      },
    });
    const apply = vi.fn();

    switchTheme("dark", { x: 0, y: 0 }, apply);

    const root = document.documentElement;
    expect(root).toHaveClass("theme-reveal");
    expect(root).toHaveClass("dark");
    expect(root.style.getPropertyValue("--vt-x")).toBe("0px");
    expect(apply).toHaveBeenCalledWith("dark");

    finish();
    await finished;
    await Promise.resolve();
    expect(root).not.toHaveClass("theme-reveal");
  });

  it("resolves 'system' using the OS preference", () => {
    stubMatchMedia({ dark: true });
    Object.assign(document, {
      startViewTransition: (cb: () => void) => {
        cb();
        return { finished: Promise.resolve() };
      },
    });
    switchTheme("system", { x: 5, y: 5 }, vi.fn());
    expect(document.documentElement).toHaveClass("dark");
  });
});
