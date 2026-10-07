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

describe("page heading", () => {
  it("renders the current page title as the desktop h1", () => {
    render(
      <SidebarProvider>
        <Topbar />
      </SidebarProvider>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Employees" })).toBeInTheDocument();
  });

  it("renders the current page title as the mobile h1", () => {
    render(<MobileTopBar user={{ id: "1", name: "Priya Sharma", role: "super_admin" } as Me} />);
    expect(screen.getByRole("heading", { level: 1, name: "Employees" })).toBeInTheDocument();
  });
});
