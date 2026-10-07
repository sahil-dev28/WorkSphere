import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCommandShortcut } from "./use-command-shortcut";

function Probe({ onToggle }: { onToggle: () => void }) {
  useCommandShortcut(onToggle);
  return <input aria-label="elsewhere" />;
}

describe("useCommandShortcut", () => {
  it("toggles on Cmd+K and Ctrl+K", () => {
    const onToggle = vi.fn();
    render(<Probe onToggle={onToggle} />);
    fireEvent.keyDown(document.body, { key: "k", metaKey: true });
    fireEvent.keyDown(document.body, { key: "K", ctrlKey: true });
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("ignores the shortcut while typing in another field", () => {
    const onToggle = vi.fn();
    const { getByLabelText } = render(<Probe onToggle={onToggle} />);
    fireEvent.keyDown(getByLabelText("elsewhere"), { key: "k", metaKey: true });
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("ignores plain K", () => {
    const onToggle = vi.fn();
    render(<Probe onToggle={onToggle} />);
    fireEvent.keyDown(document.body, { key: "k" });
    expect(onToggle).not.toHaveBeenCalled();
  });
});
