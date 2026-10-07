import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginCard } from "./login-card";

vi.mock("@/lib/actions/auth", () => ({ loginAction: vi.fn(async () => ({})) }));
vi.mock("@/components/auth/change-password-fields", () => ({ ChangePasswordFields: () => null }));

const accounts = [
  { role: "super_admin" as const, email: "admin@worksphere.dev", password: "admin-pass" },
  { role: "employee" as const, email: "emp@worksphere.dev", password: "emp-pass" },
];

describe("LoginCard", () => {
  it("fills the form with a demo account without signing in", () => {
    render(<LoginCard demoAccounts={accounts} />);
    fireEvent.click(screen.getByRole("button", { name: /employee/i }));

    expect(screen.getByLabelText("Work email")).toHaveValue("emp@worksphere.dev");
    expect(screen.getByLabelText("Password")).toHaveValue("emp-pass");
    expect(screen.getByRole("button", { name: /employee/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/credentials\s+filled in/i)).toBeInTheDocument();
  });

  it("hides the demo section when no demo accounts are configured", () => {
    render(<LoginCard demoAccounts={[]} />);
    expect(screen.queryByText("Try the demo")).not.toBeInTheDocument();
  });
});
