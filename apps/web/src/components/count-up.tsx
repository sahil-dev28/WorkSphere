"use client";

import { cn } from "@WorkSphere/ui/lib/utils";

import { useCountUp } from "@/hooks/use-count-up";

export function CountUp({ value, className }: { value: number; className?: string }) {
  const { ref, value: current } = useCountUp<HTMLSpanElement>(value);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {current}
    </span>
  );
}
