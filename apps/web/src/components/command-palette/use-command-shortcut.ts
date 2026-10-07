"use client";

import { useEffect, useRef } from "react";

function isForeignField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest("[data-command-palette]")) return false;
  return target.isContentEditable || target.matches("input, textarea, select");
}

export function useCommandShortcut(onToggle: () => void) {
  const handler = useRef(onToggle);

  useEffect(() => {
    handler.current = onToggle;
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      if (isForeignField(event.target)) return;
      event.preventDefault();
      handler.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
