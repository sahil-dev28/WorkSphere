"use client";

import { cn } from "@WorkSphere/ui/lib/utils";
import { CornerDownLeft, Loader2, Search } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createContext, use, useEffect, useId, useState, useTransition } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@WorkSphere/ui/components/avatar";
import { Dialog, DialogContent, DialogTitle } from "@WorkSphere/ui/components/dialog";

import { switchTheme } from "@/components/theme-switch";
import { demoLoginAction, logoutAction } from "@/lib/actions/auth";
import { searchPeopleAction, type PersonResult } from "@/lib/actions/search";
import type { DemoSession } from "@/lib/demo-credentials";
import { initials } from "@/lib/format";
import type { Me } from "@/lib/session";

import { buildCommandItems, filterCommandItems, type CommandItem } from "./command-items";
import { useCommandShortcut } from "./use-command-shortcut";

type Option = { kind: "item"; item: CommandItem } | { kind: "person"; person: PersonResult };

const CommandPaletteContext = createContext<{ openPalette: () => void } | null>(null);

export function useCommandPalette() {
  const ctx = use(CommandPaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used within a CommandPaletteProvider");
  return ctx;
}

export function CommandPaletteProvider({
  role,
  demo,
  children,
}: {
  role: Me["role"];
  demo?: DemoSession | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  useCommandShortcut(() => setOpen((value) => !value));

  return (
    <CommandPaletteContext value={{ openPalette: () => setOpen(true) }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        {open ? <CommandPalette role={role} demo={demo} onClose={() => setOpen(false)} /> : null}
      </Dialog>
    </CommandPaletteContext>
  );
}

function usePeopleSearch(query: string, enabled: boolean) {
  const [people, setPeople] = useState<PersonResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!enabled || q.length < 2) {
      setPeople([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchPeopleAction(q);
      if (!cancelled) {
        setPeople(results);
        setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, enabled]);

  return { people, searching };
}

function CommandPalette({
  role,
  demo,
  onClose,
}: {
  role: Me["role"];
  demo?: DemoSession | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const { people, searching } = usePeopleSearch(query, role !== "employee");

  const items = filterCommandItems(buildCommandItems({ role, demo }), query);
  const options: Option[] = [
    ...items.map((item) => ({ kind: "item" as const, item })),
    ...people.map((person) => ({ kind: "person" as const, person })),
  ];
  const activeIndex = options.length === 0 ? -1 : Math.min(active, options.length - 1);

  function run(option: Option) {
    onClose();
    if (option.kind === "person") {
      router.push(`/directory?action=view&employeeId=${option.person.id}` as Route);
      return;
    }
    const { run: command } = option.item;
    switch (command.type) {
      case "navigate":
        router.push(command.href);
        break;
      case "theme":
        switchTheme(resolvedTheme === "dark" ? "light" : "dark", { x: Number.NaN, y: Number.NaN }, setTheme);
        break;
      case "logout":
        startTransition(() => logoutAction());
        break;
      case "demo":
        startTransition(async () => {
          const result = await demoLoginAction(command.role);
          if (result?.error) toast.error(result.error);
        });
        break;
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (options.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((activeIndex + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((activeIndex - 1 + options.length) % options.length);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      run(options[activeIndex]!);
    }
  }

  const optionId = (index: number) => `${listId}-option-${index}`;
  const groups: { label: string; entries: { option: Option; index: number }[] }[] = [];
  options.forEach((option, index) => {
    const label = option.kind === "person" ? "People" : option.item.group;
    const group = groups.find((g) => g.label === label) ?? groups[groups.push({ label, entries: [] }) - 1]!;
    group.entries.push({ option, index });
  });

  return (
    <DialogContent
      showCloseButton={false}
      data-command-palette
      className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
    >
      <DialogTitle className="sr-only">Command palette</DialogTitle>
      <div className="flex items-center gap-2 border-b border-border px-4">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          autoFocus
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
          aria-autocomplete="list"
          placeholder={role === "employee" ? "Search pages and actions…" : "Search people, pages and actions…"}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {searching ? <Loader2 aria-label="Searching" className="size-4 animate-spin text-muted-foreground" /> : null}
      </div>

      <div id={listId} role="listbox" aria-label="Results" className="max-h-80 overflow-y-auto p-2">
        {options.length === 0 && !searching ? (
          <p className="px-3 py-8 text-center text-[13px] text-muted-foreground">
            {query.trim() ? `No results for “${query.trim()}”` : "Start typing to search"}
          </p>
        ) : null}
        {groups.map((group) => (
          <div key={group.label} role="group" aria-label={group.label} className="pb-1">
            <p className="px-2 pt-2 pb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              {group.label}
            </p>
            {group.entries.map(({ option, index }) => {
              const selected = index === activeIndex;
              return (
                <div
                  key={option.kind === "person" ? option.person.id : option.item.id}
                  id={optionId(index)}
                  role="option"
                  aria-selected={selected}
                  onMouseMove={() => setActive(index)}
                  onClick={() => run(option)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-[13px]",
                    selected && "bg-accent text-accent-foreground",
                  )}
                >
                  {option.kind === "person" ? (
                    <>
                      <Avatar className="size-6">
                        <AvatarFallback colorKey={option.person.name} className="text-[10px]">
                          {initials(option.person.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">{option.person.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {option.person.designation} · {option.person.department}
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <option.item.icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{option.item.label}</span>
                    </>
                  )}
                  {selected ? <CornerDownLeft aria-hidden className="size-3.5 text-muted-foreground" /> : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        <span>
          <kbd className="font-mono">↑↓</kbd> navigate
        </span>
        <span>
          <kbd className="font-mono">↵</kbd> select
        </span>
        <span>
          <kbd className="font-mono">esc</kbd> close
        </span>
      </div>
    </DialogContent>
  );
}
