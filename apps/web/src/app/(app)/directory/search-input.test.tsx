import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SearchInput } from "./search-input";

const mocks = vi.hoisted(() => ({ replace: vi.fn(), search: "q=ali" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => "/directory",
  useSearchParams: () => new URLSearchParams(mocks.search),
}));

afterEach(() => {
  mocks.replace.mockReset();
  mocks.search = "q=ali";
  vi.useRealTimers();
});

describe("SearchInput", () => {
  it("empties when the search is cleared from elsewhere", () => {
    const { rerender } = render(<SearchInput defaultValue="ali" />);
    expect(screen.getByRole("textbox", { name: "Search employees" })).toHaveValue("ali");
    mocks.search = "";
    rerender(<SearchInput defaultValue="" />);
    expect(screen.getByRole("textbox", { name: "Search employees" })).toHaveValue("");
  });

  it("drops a pending keystroke when the search is cleared from elsewhere", () => {
    vi.useFakeTimers();
    const { rerender } = render(<SearchInput defaultValue="ali" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Search employees" }), { target: { value: "alix" } });
    mocks.search = "";
    rerender(<SearchInput defaultValue="" />);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("keeps the user's text after its own debounced update lands", () => {
    vi.useFakeTimers();
    mocks.search = "";
    const { rerender } = render(<SearchInput defaultValue="" />);
    const input = screen.getByRole("textbox", { name: "Search employees" });
    fireEvent.change(input, { target: { value: "bob " } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(mocks.replace).toHaveBeenCalledWith("/directory?q=bob", { scroll: false });
    mocks.search = "q=bob";
    rerender(<SearchInput defaultValue="bob" />);
    expect(input).toHaveValue("bob ");
  });
});
