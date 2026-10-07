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

  const root = document.documentElement;
  const dark =
    next === "dark" ||
    (next === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );

  root.style.setProperty("--vt-x", `${origin.x}px`);
  root.style.setProperty("--vt-y", `${origin.y}px`);
  root.style.setProperty("--vt-r", `${radius}px`);
  root.classList.add("theme-reveal");

  // next-themes applies its class in an effect, too late for the snapshot, so set it here.
  const transition = document.startViewTransition(() => {
    root.classList.toggle("dark", dark);
    apply(next);
  });
  transition.finished.finally(() => root.classList.remove("theme-reveal"));
}
