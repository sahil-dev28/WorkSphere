import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DirectoryFilters } from "./filters";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/directory",
  useSearchParams: () => new URLSearchParams(),
}));

describe("DirectoryFilters", () => {
  it("shows readable labels instead of raw values", () => {
    render(<DirectoryFilters department="all" role="hr_manager" status="on_leave" sort="name_asc" />);
    expect(screen.getByText("All departments")).toBeInTheDocument();
    expect(screen.getByText("HR Manager")).toBeInTheDocument();
    expect(screen.getByText("On Leave")).toBeInTheDocument();
    expect(screen.getByText("Name (A–Z)")).toBeInTheDocument();
    expect(screen.queryByText("hr_manager")).not.toBeInTheDocument();
    expect(screen.queryByText("name_asc")).not.toBeInTheDocument();
  });
});
