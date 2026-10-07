import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LandingView } from "./landing-view";

vi.mock("@/lib/actions/auth", () => ({ demoLoginAction: vi.fn() }));
vi.mock("next-themes", () => ({ useTheme: () => ({ setTheme: vi.fn() }) }));

describe("LandingView", () => {
  it("shows the headline and one-click cards for configured roles only", () => {
    render(<LandingView hasSession={false} roles={["super_admin", "employee"]} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Everyone in your company, organized." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Explore the demo as Super Admin" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Explore the demo as Employee" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Explore the demo as HR Manager" })).not.toBeInTheDocument();
  });

  it("falls back to sign in when no demo roles are configured", () => {
    render(<LandingView hasSession={false} roles={[]} />);
    expect(screen.queryByText("Live demo · no sign-up")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Explore the demo as/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Sign in/ }).length).toBeGreaterThan(0);
  });

  it("offers the dashboard instead of demo sign-in to signed-in visitors", () => {
    render(<LandingView hasSession roles={["super_admin"]} />);
    expect(screen.queryByRole("button", { name: /Explore the demo as/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Open dashboard/ }).length).toBeGreaterThan(0);
  });

  it("links to the source code", () => {
    render(<LandingView hasSession={false} roles={[]} />);
    expect(screen.getByRole("link", { name: /View source on GitHub/ })).toHaveAttribute(
      "href",
      "https://github.com/sahil-dev28/WorkSphere",
    );
  });

  it("keeps the landing to the hero alone", () => {
    render(<LandingView hasSession={false} roles={["super_admin"]} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Sections" })).not.toBeInTheDocument();
  });
});
