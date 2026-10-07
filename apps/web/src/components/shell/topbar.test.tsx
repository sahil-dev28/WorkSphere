import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Me } from "@/lib/session";

import { CommandPaletteProvider } from "@/components/command-palette/command-palette";

import { MobileTopBar } from "./mobile-nav";
import { SidebarProvider } from "./sidebar-provider";
import { Topbar } from "./topbar";

vi.mock("next/navigation", () => ({ usePathname: () => "/directory", useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next-themes", () => ({ useTheme: () => ({ setTheme: vi.fn() }) }));
vi.mock("@/lib/actions/auth", () => ({ logoutAction: vi.fn() }));
vi.mock("@/components/auth/change-password-dialog", () => ({
  ChangePasswordDialog: ({ trigger }: { trigger: React.ReactNode }) => trigger,
}));

describe("shell headings", () => {
  it("shows the current page in the breadcrumb without owning the page h1", () => {
    render(
      <CommandPaletteProvider role="super_admin">
        <SidebarProvider>
          <Topbar />
        </SidebarProvider>
      </CommandPaletteProvider>,
    );
    expect(screen.getByText("Employees")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("labels a demo session with its role", () => {
    render(
      <CommandPaletteProvider role="super_admin">
        <SidebarProvider>
          <Topbar demo={{ current: "hr_manager", available: ["hr_manager"] }} />
        </SidebarProvider>
      </CommandPaletteProvider>,
    );
    expect(screen.getByText("Demo · HR Manager")).toBeInTheDocument();
  });

  it("leaves the mobile top bar without an h1", () => {
    render(
      <CommandPaletteProvider role="super_admin">
        <MobileTopBar user={{ id: "1", name: "Priya Sharma", role: "super_admin" } as Me} />
      </CommandPaletteProvider>,
    );
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });
});
