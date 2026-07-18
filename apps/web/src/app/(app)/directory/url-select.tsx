"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@WorkSphere/ui/components/select";
import { cn } from "@WorkSphere/ui/lib/utils";

interface Option {
  value: string;
  label: string;
}

// Generic single-value filter bound to one URL search param. Used for the
// three filter dropdowns (with an "all" sentinel that clears the param) and
// for sort (no "all" — always has a value).
export function UrlSelect({
  paramName,
  allLabel,
  options,
  className,
}: {
  paramName: string;
  allLabel?: string;
  options: Option[];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fallback = allLabel ? "all" : (options[0]?.value ?? "");
  const current = searchParams.get(paramName) ?? fallback;

  const items = allLabel ? [{ value: "all", label: allLabel }, ...options] : options;

  function handleChange(next: string | null) {
    if (next === null) return;

    const params = new URLSearchParams(searchParams.toString());
    if (allLabel && next === "all") {
      params.delete(paramName);
    } else {
      params.set(paramName, next);
    }
    const query = params.toString();
    router.replace((query ? `${pathname}?${query}` : pathname) as Route, { scroll: false });
  }

  return (
    <Select items={items} value={current} onValueChange={handleChange}>
      <SelectTrigger className={cn("w-[150px]", className)}>
        <SelectValue placeholder={allLabel ?? options[0]?.label} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
