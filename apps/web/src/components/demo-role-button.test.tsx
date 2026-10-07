import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DemoLoginProvider, DemoRoleButton } from "./demo-role-button";

const mocks = vi.hoisted(() => ({ demoLoginAction: vi.fn(), toastError: vi.fn() }));

vi.mock("@/lib/actions/auth", () => ({ demoLoginAction: mocks.demoLoginAction }));
vi.mock("sonner", () => ({ toast: { error: mocks.toastError } }));

afterEach(() => {
  mocks.demoLoginAction.mockReset();
  mocks.toastError.mockReset();
});

function renderButtons() {
  return render(
    <DemoLoginProvider>
      <DemoRoleButton role="super_admin" />
      <DemoRoleButton role="hr_manager" variant="button" />
    </DemoLoginProvider>,
  );
}

describe("DemoRoleButton", () => {
  it("disables every demo button while one sign-in is pending", async () => {
    mocks.demoLoginAction.mockReturnValue(new Promise(() => {}));
    renderButtons();
    fireEvent.click(screen.getByRole("button", { name: "Explore the demo as Super Admin" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Explore the demo as Super Admin" })).toBeDisabled();
      expect(screen.getByRole("button", { name: /Enter as HR/ })).toBeDisabled();
    });
    expect(mocks.demoLoginAction).toHaveBeenCalledWith("super_admin");
  });

  it("shows the error toast and re-enables the buttons when sign-in fails", async () => {
    mocks.demoLoginAction.mockResolvedValue({ error: "This demo account isn't available right now." });
    renderButtons();
    fireEvent.click(screen.getByRole("button", { name: /Enter as HR/ }));
    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith("This demo account isn't available right now.");
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Enter as HR/ })).toBeEnabled();
    });
  });
});
