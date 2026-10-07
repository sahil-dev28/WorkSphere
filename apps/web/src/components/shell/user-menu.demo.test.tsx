import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DropdownMenu, DropdownMenuContent } from "@WorkSphere/ui/components/dropdown-menu";

import { AccountMenuItems } from "./user-menu";

const mocks = vi.hoisted(() => ({ demoLoginAction: vi.fn(), toastError: vi.fn() }));

vi.mock("@/lib/actions/auth", () => ({ logoutAction: vi.fn(), demoLoginAction: mocks.demoLoginAction }));
vi.mock("sonner", () => ({ toast: { error: mocks.toastError } }));

afterEach(() => {
  mocks.demoLoginAction.mockReset();
  mocks.toastError.mockReset();
});

function renderMenu(demo?: Parameters<typeof AccountMenuItems>[0]["demo"]) {
  return render(
    <DropdownMenu defaultOpen>
      <DropdownMenuContent>
        <AccountMenuItems demo={demo} />
      </DropdownMenuContent>
    </DropdownMenu>,
  );
}

describe("AccountMenuItems demo switching", () => {
  it("offers the other demo roles to a demo session", async () => {
    renderMenu({ current: "hr_manager", available: ["super_admin", "hr_manager", "employee"] });
    expect(await screen.findByRole("menuitem", { name: /Switch to Super Admin/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Switch to Employee/ })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /Switch to HR Manager/ })).not.toBeInTheDocument();
  });

  it("shows nothing extra for real accounts", async () => {
    renderMenu(undefined);
    await screen.findByText("Log out");
    expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument();
  });

  it("toasts when the switch fails", async () => {
    mocks.demoLoginAction.mockResolvedValue({ error: "This demo account isn't available right now." });
    renderMenu({ current: "hr_manager", available: ["super_admin", "hr_manager"] });
    fireEvent.click(await screen.findByRole("menuitem", { name: /Switch to Super Admin/ }));
    await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith("This demo account isn't available right now."));
    expect(mocks.demoLoginAction).toHaveBeenCalledWith("super_admin");
  });
});
