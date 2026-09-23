"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";

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

export type PersonSelectOption = {
  id: string;
  fullName: string;
  // Right-hand label, e.g. the person's role.
  meta?: string;
  // Second line under the name, e.g. why they cannot be chosen.
  note?: string;
  noteTone?: "destructive" | "muted";
  disabled?: boolean;
};

export function PersonSelectField({
  ariaLabel,
  className,
  disabled = false,
  emptyLabel = "No one found.",
  error,
  id,
  isLoading = false,
  label,
  noneLabel,
  onChange,
  options,
  placeholder = "None",
  searchPlaceholder = "Search name...",
  triggerClassName,
  value,
}: {
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  emptyLabel?: string;
  error?: string;
  id: string;
  isLoading?: boolean;
  label?: string;
  noneLabel?: string;
  onChange: (value: string) => void;
  options: PersonSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  triggerClassName?: string;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);

  function select(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div className={cn("grid gap-1.5", className)}>
      {label && (
        <label className="text-sm font-semibold text-foreground" htmlFor={id}>
          {label}
        </label>
      )}
      <Popover modal onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          aria-invalid={Boolean(error)}
          aria-label={ariaLabel}
          className={cn(
            "flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 text-base text-[#121212] transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:h-10 md:text-sm sm:rounded-2xl",
            triggerClassName,
          )}
          disabled={disabled}
          id={id}
          type="button"
        >
          <span
            className={cn(
              "min-w-0 truncate text-left",
              selected ? "font-medium" : "normal-case text-[#121212]/55",
            )}
          >
            {selected ? selected.fullName : placeholder}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-[#121212]/45" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) p-0"
          collisionPadding={16}
          sideOffset={6}
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList className="max-h-44">
              <CommandEmpty>
                {isLoading ? "Loading people..." : emptyLabel}
              </CommandEmpty>
              <CommandGroup>
                {noneLabel && (
                  <CommandItem onSelect={() => select("")} value="none">
                    <span className="flex-1 text-muted-foreground">
                      {noneLabel}
                    </span>
                    {value === "" && <CheckIcon className="size-4 shrink-0" />}
                  </CommandItem>
                )}
                {options.map((option) => (
                  <CommandItem
                    disabled={option.disabled}
                    key={option.id}
                    onSelect={() => {
                      if (!option.disabled) {
                        select(option.id);
                      }
                    }}
                    value={`${option.fullName} ${option.meta ?? ""}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.fullName}</span>
                      {option.note && (
                        <span
                          className={cn(
                            "block truncate text-xs",
                            option.noteTone === "muted"
                              ? "text-muted-foreground"
                              : "text-destructive",
                          )}
                        >
                          {option.note}
                        </span>
                      )}
                    </span>
                    {option.meta && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {option.meta}
                      </span>
                    )}
                    {value === option.id && (
                      <CheckIcon className="size-4 shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
