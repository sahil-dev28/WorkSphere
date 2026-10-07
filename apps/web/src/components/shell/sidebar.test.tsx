import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Me } from "@/lib/session";

import { Sidebar } from "./sidebar";
import { SidebarProvider } from "./sidebar-provider";
import { SidebarCollapseProbe } from "./sidebar-test-probe";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("next-themes", () => ({ useTheme: () => ({ setTheme: vi.fn() }) }));
vi.mock("@/lib/actions/auth", () => ({ logoutAction: vi.fn() }));
vi.mock("@/components/auth/change-password-dialog", () => ({
  ChangePasswordDialog: ({ trigger }: { trigger: React.ReactNode }) => trigger,
}));

const admin = { id: "1", name: "Priya Sharma", role: "super_admin" } as Me;

describe("Sidebar", () => {
  it("groups navigation and marks the active page", () => {
    render(
      <SidebarProvider>
        <Sidebar user={admin} />
      </SidebarProvider>,
    );
    expect(screen.getByText("Workspace")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
  });

  it("keeps every nav link and the account menu labelled when collapsed", () => {
    render(
      <SidebarProvider>
        <SidebarCollapseProbe />
        <Sidebar user={admin} />
      </SidebarProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "collapse" }));

    for (const label of ["Dashboard", "Employees", "Organization", "My Profile"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(screen.queryByText("Workspace")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Account menu" })).toBeInTheDocument();
  });
});
