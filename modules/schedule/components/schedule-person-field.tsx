"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import type { SchedulePersonOption } from "@/modules/schedule/types/schedule";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

export function SchedulePersonField({
  disabled = false,
  error,
  id,
  isLoading,
  label,
  onChange,
  people,
  value,
}: {
  disabled?: boolean;
  error?: string;
  id: string;
  isLoading: boolean;
  label: string;
  onChange: (value: string) => void;
  people: SchedulePersonOption[];
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = people.find((person) => person.id === value);

  function select(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-semibold text-foreground" htmlFor={id}>
        {label}
      </label>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          aria-invalid={Boolean(error)}
          className={cn(
            "flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 text-base text-[#121212] transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:h-10 md:text-sm sm:rounded-2xl",
          )}
          disabled={disabled}
          id={id}
          type="button"
        >
          {selected ? (
            <span className="min-w-0 truncate text-left font-medium">
              {selected.fullName}
            </span>
          ) : (
            <span className="min-w-0 truncate text-left text-muted-foreground">
              None
            </span>
          )}
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) p-0"
          collisionPadding={16}
          sideOffset={6}
        >
          <Command>
            <CommandInput placeholder="Search name..." />
            <CommandList className="max-h-44">
              <CommandEmpty>
                {isLoading ? "Loading people..." : "No one found."}
              </CommandEmpty>
              <CommandGroup>
                <CommandItem onSelect={() => select("")} value="none">
                  <span className="flex-1 text-muted-foreground">None</span>
                  {value === "" && <CheckIcon className="size-4 shrink-0" />}
                </CommandItem>
                {people.map((person) => (
                  <CommandItem
                    key={person.id}
                    onSelect={() => select(person.id)}
                    value={`${person.fullName} ${person.roleLabel}`}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {person.fullName}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {person.roleLabel}
                    </span>
                    {value === person.id && (
                      <CheckIcon className="size-4 shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
