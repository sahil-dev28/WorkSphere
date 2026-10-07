type Theme = "light" | "dark" | "system";

export function switchTheme(
  next: Theme,
  origin: { x: number; y: number },
  apply: (theme: string) => void,
): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof document.startViewTransition !== "function" || reduced) {
    apply(next);
    return;
  }

  // Keyboard activation passes a KeyboardEvent, so coordinates can be missing.
  const x = Number.isFinite(origin.x) ? origin.x : window.innerWidth / 2;
  const y = Number.isFinite(origin.y) ? origin.y : window.innerHeight / 2;
  const root = document.documentElement;
  const dark =
    next === "dark" ||
    (next === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  root.style.setProperty("--vt-x", `${x}px`);
  root.style.setProperty("--vt-y", `${y}px`);
  root.style.setProperty("--vt-r", `${radius}px`);
  root.classList.add("theme-reveal");

  // next-themes applies its class in an effect, too late for the snapshot, so set it here.
  const transition = document.startViewTransition(() => {
    root.classList.toggle("dark", dark);
    apply(next);
  });
  transition.finished.finally(() => root.classList.remove("theme-reveal"));
}
