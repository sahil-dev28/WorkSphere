import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RouteTransition } from "./route-transition";

let pathname = "/directory";

vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    ViewTransition: (props: { children: React.ReactNode; default?: string; enter?: string; exit?: string }) => (
      <div data-testid="vt" data-default={props.default} data-enter={props.enter} data-exit={props.exit}>
        {props.children}
      </div>
    ),
  };
});

describe("RouteTransition", () => {
  it("animates only when the route enters or exits, not on in-page updates", () => {
    render(<RouteTransition>page</RouteTransition>);
    const vt = screen.getByTestId("vt");
    expect(vt).toHaveAttribute("data-default", "none");
    expect(vt).toHaveAttribute("data-enter", "auto");
    expect(vt).toHaveAttribute("data-exit", "auto");
  });

  it("remounts its subtree when the pathname changes", () => {
    const { rerender } = render(<RouteTransition>page</RouteTransition>);
    const first = screen.getByTestId("vt");
    pathname = "/org-chart";
    rerender(<RouteTransition>page</RouteTransition>);
    expect(screen.getByTestId("vt")).not.toBe(first);
  });
});
