import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Me } from "@/lib/session";

import { MobileTopBar } from "./mobile-nav";
import { SidebarProvider } from "./sidebar-provider";
import { Topbar } from "./topbar";

vi.mock("next/navigation", () => ({ usePathname: () => "/directory" }));
vi.mock("next-themes", () => ({ useTheme: () => ({ setTheme: vi.fn() }) }));
vi.mock("@/lib/actions/auth", () => ({ logoutAction: vi.fn() }));
vi.mock("@/components/auth/change-password-dialog", () => ({
  ChangePasswordDialog: ({ trigger }: { trigger: React.ReactNode }) => trigger,
}));

describe("shell headings", () => {
  it("shows the current page in the breadcrumb without owning the page h1", () => {
    render(
      <SidebarProvider>
        <Topbar />
      </SidebarProvider>,
    );
    expect(screen.getByText("Employees")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("labels a demo session with its role", () => {
    render(
      <SidebarProvider>
        <Topbar demo={{ current: "hr_manager", available: ["hr_manager"] }} />
      </SidebarProvider>,
    );
    expect(screen.getByText("Demo · HR Manager")).toBeInTheDocument();
  });

  it("leaves the mobile top bar without an h1", () => {
    render(<MobileTopBar user={{ id: "1", name: "Priya Sharma", role: "super_admin" } as Me} />);
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });
});
