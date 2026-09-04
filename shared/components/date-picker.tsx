"use client";

import { addYears, format, isValid, parse, subYears } from "date-fns";
import { CalendarIcon, ChevronDownIcon, XIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

const VALUE_FORMAT = "yyyy-MM-dd";

function parseValue(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = parse(value, VALUE_FORMAT, new Date());

  return isValid(parsed) ? parsed : undefined;
}

// Calendar date picker used everywhere the app collects a date. Values in
// and out are YYYY-MM-DD strings so existing schemas and columns are
// untouched. Replaces native <input type="date">, which has no placeholder,
// renders blank on iOS, and looks different on every phone.
export function DatePicker({
  allowClear = false,
  className,
  disabled = false,
  id,
  max,
  min,
  onBlur,
  onChange,
  placeholder = "Select date",
  value,
  ...ariaProps
}: {
  allowClear?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean | "true";
  className?: string;
  disabled?: boolean;
  id?: string;
  /** Latest selectable date, YYYY-MM-DD. */
  max?: string;
  /** Earliest selectable date, YYYY-MM-DD. */
  min?: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string | undefined;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = parseValue(value);
  const minDate = parseValue(min);
  const maxDate = parseValue(max);
  const today = new Date();

  return (
    <Popover
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          onBlur?.();
        }
      }}
      open={open}
    >
      <PopoverTrigger
        aria-describedby={ariaProps["aria-describedby"]}
        aria-invalid={ariaProps["aria-invalid"]}
        aria-required={ariaProps["aria-required"]}
        className={cn(
          "flex h-9 w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-base text-[#121212] transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:h-10 md:text-sm sm:rounded-2xl",
          className,
        )}
        disabled={disabled}
        id={id}
        type="button"
      >
        <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        {selected ? (
          <span className="min-w-0 flex-1 truncate text-left font-medium">
            {format(selected, "MMM d, yyyy")}
          </span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-left text-muted-foreground">
            {placeholder}
          </span>
        )}
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0" sideOffset={6}>
        <Calendar
          captionLayout="dropdown"
          defaultMonth={selected ?? minDate ?? today}
          disabled={[
            ...(minDate ? [{ before: minDate }] : []),
            ...(maxDate ? [{ after: maxDate }] : []),
          ]}
          endMonth={maxDate ?? addYears(today, 20)}
          mode="single"
          onSelect={(date) => {
            onChange(date ? format(date, VALUE_FORMAT) : "");
            setOpen(false);
          }}
          selected={selected}
          startMonth={minDate ?? subYears(today, 10)}
        />
        {allowClear && selected && (
          <div className="border-t p-2">
            <Button
              className="w-full"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              <XIcon className="size-4" />
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
