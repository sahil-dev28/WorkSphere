import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Me } from "@/lib/session";

import { DirectoryTable } from "./directory-table";

const mocks = vi.hoisted(() => ({
  getEmployeesTable: vi.fn(),
  replace: vi.fn(),
  search: "role=employee",
}));

vi.mock("@/lib/actions/employees", () => ({ getEmployeesTable: mocks.getEmployeesTable }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => "/directory",
  useSearchParams: () => new URLSearchParams(mocks.search),
}));

const admin = { id: "1", name: "Admin", email: "a@b.dev", role: "super_admin", mustChangePassword: false } as Me;

function renderTable() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <DirectoryTable user={admin} canManage pageSize={10} />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  mocks.getEmployeesTable.mockReset();
  mocks.replace.mockReset();
  mocks.search = "role=employee";
});

describe("DirectoryTable states", () => {
  it("offers to clear filters when nothing matches", async () => {
    mocks.getEmployeesTable.mockResolvedValue({ data: [], total: 0 });
    renderTable();
    expect(await screen.findByText("No employees match these filters", undefined, { timeout: 3000 })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Clear filters" })[0]);
    expect(mocks.replace).toHaveBeenCalledWith("/directory", { scroll: false });
  });

  it("leads back to the first page when the current page is past the last result", async () => {
    mocks.search = "page=9";
    mocks.getEmployeesTable.mockResolvedValue({ data: [], total: 12 });
    renderTable();
    expect(await screen.findByText("Nothing on this page", undefined, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.queryByText("No employees yet")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Go to first page" }));
    expect(mocks.replace).toHaveBeenCalledWith("/directory", { scroll: false });
  });

  it("shows the result count", async () => {
    mocks.getEmployeesTable.mockResolvedValue({ data: [], total: 0 });
    renderTable();
    expect(await screen.findByText("0 employees", undefined, { timeout: 3000 })).toBeInTheDocument();
  });

  it("lets the user retry after a load error", async () => {
    mocks.getEmployeesTable.mockRejectedValue(new Error("boom"));
    renderTable();
    expect(await screen.findByText("Couldn't load employees", undefined, { timeout: 3000 })).toBeInTheDocument();
    mocks.getEmployeesTable.mockResolvedValue({ data: [], total: 0 });
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(mocks.getEmployeesTable).toHaveBeenCalledTimes(2));
  });
});
