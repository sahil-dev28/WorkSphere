"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    if (skipNextUpdate.current) {
      skipNextUpdate.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      updateParams({ q: value.trim() || null });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [value, updateParams]);

  function clear() {
    skipNextUpdate.current = true;
    setValue("");
    updateParams({ q: null });
  }

  return (
    <InputGroup className="min-[700px]:flex-1">
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
