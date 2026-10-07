"use client";

import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@WorkSphere/ui/components/input-group";

import { useDirectoryParams } from "./use-directory-params";

const DEBOUNCE_MS = 300;

export function SearchInput({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const updateParams = useDirectoryParams();
  const skipNextUpdate = useRef(true);
  const urlQuery = useSearchParams().get("q") ?? "";
  const lastSent = useRef(defaultValue.trim());

  // Another control (e.g. "Clear filters") changed q: mirror it and drop any pending keystroke.
  useEffect(() => {
    if (urlQuery === lastSent.current) return;
    lastSent.current = urlQuery;
    skipNextUpdate.current = true;
    setValue(urlQuery);
  }, [urlQuery]);

  // updateParams gets a new identity on every navigation (it closes over
  // useSearchParams(), which Next.js always returns fresh) — including
  // navigations triggered by other filters. Reading it via ref keeps this
  // effect keyed on `value` alone, so it doesn't refire (and re-navigate)
  // every time some other part of the page updates the URL.
  const updateParamsRef = useRef(updateParams);
  useLayoutEffect(() => {
    updateParamsRef.current = updateParams;
  });

  useEffect(() => {
    if (skipNextUpdate.current) {
      skipNextUpdate.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      lastSent.current = value.trim();
      updateParamsRef.current({ q: value.trim() || null });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [value]);

  function clear() {
    skipNextUpdate.current = true;
    lastSent.current = "";
    setValue("");
    updateParams({ q: null });
  }

  return (
    <InputGroup className="min-[700px]:min-w-56 min-[700px]:flex-1">
      <InputGroupAddon>
        <Search className="size-3.5" />
      </InputGroupAddon>
      <InputGroupInput
        placeholder="Search by name or email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search employees"
      />
      {value ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            size="icon-xs"
            aria-label="Clear search"
            onClick={clear}
          >
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}
