import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DropdownMenu, DropdownMenuContent } from "@WorkSphere/ui/components/dropdown-menu";

import { AccountMenuItems } from "./user-menu";

vi.mock("@/lib/actions/auth", () => ({ logoutAction: vi.fn() }));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AccountMenuItems", () => {
  it("renders without Base UI button-semantics warnings", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuContent>
          <AccountMenuItems />
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(await screen.findByText("Log out")).toBeInTheDocument();
    const baseUiWarnings = error.mock.calls.filter((args) => String(args[0]).includes("Base UI"));
    expect(baseUiWarnings).toEqual([]);
  });
});
