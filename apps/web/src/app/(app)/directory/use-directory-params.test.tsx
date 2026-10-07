import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDirectoryParams } from "./use-directory-params";

const mocks = vi.hoisted(() => ({ replace: vi.fn(), search: "page=3&role=employee" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => "/directory",
  useSearchParams: () => new URLSearchParams(mocks.search),
}));

afterEach(() => mocks.replace.mockReset());

describe("useDirectoryParams", () => {
  it("returns to the first page when a filter changes", () => {
    const { result } = renderHook(() => useDirectoryParams());
    result.current({ status: "active" });
    expect(mocks.replace).toHaveBeenCalledWith("/directory?role=employee&status=active", { scroll: false });
  });

  it("keeps the page when only the page or a dialog changes", () => {
    const { result } = renderHook(() => useDirectoryParams());
    result.current({ action: "view", employeeId: "x" });
    expect(mocks.replace).toHaveBeenCalledWith(
      "/directory?page=3&role=employee&action=view&employeeId=x",
      { scroll: false },
    );
  });
});
