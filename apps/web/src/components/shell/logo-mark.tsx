import { cn } from "@WorkSphere/ui/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-emerald-400 to-emerald-600 text-xs font-bold text-emerald-950 shadow-[0_0_12px_var(--glow-strong)]",
        className,
      )}
    >
      W
    </div>
  );
}
