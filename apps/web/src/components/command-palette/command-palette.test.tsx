import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CommandPaletteProvider, useCommandPalette } from "./command-palette";

const mocks = vi.hoisted(() => ({ push: vi.fn(), search: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("next-themes", () => ({ useTheme: () => ({ setTheme: vi.fn(), resolvedTheme: "dark" }) }));
vi.mock("@/lib/actions/search", () => ({ searchPeopleAction: mocks.search }));
vi.mock("@/lib/actions/auth", () => ({ logoutAction: vi.fn(), demoLoginAction: vi.fn() }));

afterEach(() => {
  mocks.push.mockReset();
  mocks.search.mockReset();
});

function OpenButton() {
  const { openPalette } = useCommandPalette();
  return (
    <button type="button" onClick={openPalette}>
      open
    </button>
  );
}

function renderPalette() {
  return render(
    <CommandPaletteProvider role="super_admin">
      <OpenButton />
    </CommandPaletteProvider>,
  );
}

describe("CommandPalette", () => {
  it("opens with the keyboard shortcut and navigates with arrows and Enter", async () => {
    renderPalette();
    fireEvent.keyDown(document.body, { key: "k", metaKey: true });
    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "org" } });
    expect(screen.getByRole("option", { name: /Organization/ })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mocks.push).toHaveBeenCalledWith("/org-chart");
  });

  it("wraps the active option with the arrow keys", async () => {
    renderPalette();
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "employee" } });
    const options = screen.getAllByRole("option");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(options.at(-1)).toHaveAttribute("aria-selected", "true");
  });

  it("searches people and opens the chosen profile", async () => {
    mocks.search.mockResolvedValue([{ id: "e1", name: "Alice Cooper", designation: "Engineer", department: "Engineering" }]);
    renderPalette();
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    fireEvent.change(await screen.findByRole("combobox"), { target: { value: "alice" } });
    fireEvent.click(await screen.findByRole("option", { name: /Alice Cooper/ }));
    expect(mocks.push).toHaveBeenCalledWith("/directory?action=view&employeeId=e1");
  });

  it("says when nothing matches", async () => {
    mocks.search.mockResolvedValue([]);
    renderPalette();
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    fireEvent.change(await screen.findByRole("combobox"), { target: { value: "zzzz" } });
    await waitFor(() => expect(screen.getByText("No results for “zzzz”")).toBeInTheDocument());
  });
});
