"use client";

import { SearchIcon } from "lucide-react";

import { Input } from "@/shared/components/ui/input";

export function PlanCodeSearchInput({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary-foreground/55" />
      <Input
        className="border-primary-foreground/20 bg-primary-foreground/10 pl-11 uppercase text-primary-foreground placeholder:normal-case placeholder:text-primary-foreground/55 focus-visible:border-primary-foreground/45 focus-visible:ring-primary-foreground/20"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search flight plan code..."
        value={value}
      />
    </div>
  );
}
