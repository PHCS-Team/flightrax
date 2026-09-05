"use client";

import {
  CheckIcon,
  FilterIcon,
  ImageIcon,
  PlaneIcon,
  SearchIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAircraftOptionsRealtime } from "@/modules/flight-documents/hooks/use-aircraft-options-realtime";
import { useFlightPlanAircraftOptions } from "@/modules/flight-documents/hooks/use-aircraft-options.query";
import { useFlightPlanTypeOptions } from "@/modules/flight-documents/hooks/use-flight-plan-type-options.query";
import { useInfiniteScrollSentinel } from "@/shared/hooks/use-infinite-scroll-sentinel";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

export function AircraftSelectDialog({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const { typeOptions } = useFlightPlanTypeOptions({ enabled: open });
  const {
    aircraftOptions,
    totalCount,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useFlightPlanAircraftOptions(PAGE_SIZE, debouncedSearch, typeFilter, {
    enabled: open,
  });

  useAircraftOptionsRealtime({ enabled: open });

  const sentinelRef = useInfiniteScrollSentinel({
    enabled: open,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    rootMargin: "120px",
    rootRef: listRef,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  function handleContinue() {
    if (!selectedId) {
      return;
    }

    setIsNavigating(true);
    router.replace(`/flight-documents/flight-plans/new?aircraft=${selectedId}`);
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setIsNavigating(false);
        }

        onOpenChange(nextOpen);
      }}
      open={open}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden p-4 sm:w-full sm:max-w-lg sm:p-6">
        <DialogSectionHeader
          description="Choose the aircraft for this flight plan."
          icon={PlaneIcon}
          title="Select Aircraft"
        />

        <div className="mt-1 flex gap-2">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              className="border-border bg-muted/30 pl-9 text-[#121212] placeholder:text-muted-foreground/55"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search registration mark or number"
              value={search}
            />
          </div>
          <div className="relative">
            <Select
              onValueChange={(value) => {
                setTypeFilter(value === "__all" ? "" : value);
              }}
              value={typeFilter || "__all"}
            >
              <SelectTrigger
                aria-label="Filter by type"
                className="aspect-square w-auto shrink-0 justify-center border-border bg-muted/30 px-0 text-[#121212] [&>svg:last-child]:hidden"
              >
                <FilterIcon className="size-4" />
              </SelectTrigger>
              <SelectContent
                align="end"
                className="data-[position=popper]:w-auto data-[position=popper]:min-w-44"
              >
                <SelectItem value="__all">All types</SelectItem>
                {typeOptions.map((type) => (
                  <SelectItem key={type.typeKey} value={type.typeKey}>
                    {type.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {typeFilter && (
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-popover bg-primary" />
            )}
          </div>
        </div>

        <div
          className="-mx-4 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 sm:-mx-6 sm:px-6"
          ref={listRef}
        >
          {isPending ? (
            <div className="grid gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton className="h-12 w-full" key={i} />
              ))}
            </div>
          ) : error ? (
            <p className="py-6 text-center text-sm text-destructive">
              {error.message}
            </p>
          ) : aircraftOptions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No aircraft match your search.
            </p>
          ) : (
            <div className="grid gap-1.5 pb-1">
              {aircraftOptions.map((aircraft) => {
                const isSelected = selectedId === aircraft.id;

                return (
                  <button
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg border border-border bg-muted/30 px-2.5 py-2 text-left transition",
                      aircraft.isAvailable &&
                        "cursor-pointer hover:border-primary/40 hover:bg-muted/60",
                      isSelected && "border-primary bg-primary/10",
                      !aircraft.isAvailable && "cursor-default opacity-60",
                    )}
                    disabled={!aircraft.isAvailable}
                    key={aircraft.id}
                    onClick={() => setSelectedId(aircraft.id)}
                    type="button"
                  >
                    <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                      {aircraft.photoUrl ? (
                        <div
                          aria-label={`${aircraft.registrationMark} image`}
                          className="absolute inset-0 bg-cover bg-center"
                          role="img"
                          style={{
                            backgroundImage: `url(${aircraft.photoUrl})`,
                          }}
                        />
                      ) : (
                        <ImageIcon className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {aircraft.registrationMark}
                        </p>
                        <span className="inline-flex h-4.5 shrink-0 items-center rounded-full border border-border bg-muted/40 px-1.5 font-mono text-[10px] font-semibold tracking-wide text-foreground/80">
                          {aircraft.typeIcaoDesignator}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {aircraft.typeName} &middot; No.{" "}
                        {aircraft.registrationNumber}
                      </p>
                    </div>
                    {!aircraft.isAvailable && aircraft.unavailableReason ? (
                      <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                        {aircraft.unavailableReason}
                      </span>
                    ) : (
                      <div
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border transition",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background/60 text-transparent",
                        )}
                      >
                        <CheckIcon className="size-3" />
                      </div>
                    )}
                  </button>
                );
              })}
              <div aria-hidden className="h-px" ref={sentinelRef} />
              {isFetchingNextPage && (
                <p className="py-3 text-center text-sm text-muted-foreground">
                  Loading more aircraft...
                </p>
              )}
              {!hasNextPage && aircraftOptions.length > 0 && (
                <p className="py-2 text-center text-xs text-muted-foreground">
                  All {totalCount} aircraft loaded
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="-mx-4 -mb-4 mt-4 sm:-mx-6 sm:-mb-6 sm:justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={!selectedId || isNavigating}
            onClick={handleContinue}
            type="button"
          >
            {isNavigating ? "Opening..." : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
