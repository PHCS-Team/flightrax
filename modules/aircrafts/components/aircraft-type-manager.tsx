"use client";

import {
  InfoIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SearchXIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";

import { useAircraftTypes } from "@/modules/aircrafts/hooks/use-aircraft-types.query";
import { useCreateAircraftType } from "@/modules/aircrafts/hooks/use-create-aircraft-type.action";
import { useDeleteAircraftType } from "@/modules/aircrafts/hooks/use-delete-aircraft-type.action";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function AircraftTypeManager({
  onOpenChange,
  open,
  trigger,
}: {
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  trigger?: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const handleOpenChange = onOpenChange ?? setInternalOpen;

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-6 sm:max-w-lg">
        <DialogSectionHeader
          description="Create and delete aircraft types used across the fleet."
          icon={PencilIcon}
          title="Manage aircraft types"
        />
        <AircraftTypeList />
      </DialogContent>
    </Dialog>
  );
}

function AircraftTypeList() {
  const { aircraftTypes, isPending } = useAircraftTypes();
  const [filter, setFilter] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  if (isPending) {
    return (
      <div className="mt-3 grid gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton className="h-10 w-full" key={i} />
        ))}
      </div>
    );
  }

  const filteredTypes = aircraftTypes.filter(
    (t) =>
      !filter ||
      t.type.toLowerCase().includes(filter.toLowerCase()) ||
      t.typeKey.toLowerCase().includes(filter.toLowerCase()),
  );

  const hasTypes = aircraftTypes.length > 0;
  const hasResults = filteredTypes.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CreateTypeRow />

      {hasTypes && (
        <>
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <button
                className="cursor-pointer text-xs font-medium text-primary hover:underline"
                onClick={() => {
                  setShowFilter((prev) => !prev);
                  if (showFilter) setFilter("");
                }}
                type="button"
              >
                {showFilter ? "Click to close search" : "Click to search"}
              </button>
              <span className="text-xs text-muted-foreground">
                {filteredTypes.length} of {aircraftTypes.length} type
                {aircraftTypes.length !== 1 ? "s" : ""}
              </span>
            </div>
            <Separator />
            {showFilter && (
              <div className="relative pt-2">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  autoFocus
                  className="border-border bg-muted/30 pl-9 text-foreground placeholder:text-muted-foreground/55"
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter types..."
                  value={filter}
                />
              </div>
            )}
          </div>

          <div className="-mx-6 mt-3 min-h-0 flex-1 overflow-y-auto px-6">
            {!hasResults ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <SearchXIcon className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No types matching{" "}
                  <span className="font-medium text-foreground/80">
                    &ldquo;{filter}&rdquo;
                  </span>
                </p>
                <button
                  className="cursor-pointer text-xs font-medium text-primary hover:underline"
                  onClick={() => setFilter("")}
                  type="button"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              <div className="grid gap-2 pb-1">
                {filteredTypes.map((type) => (
                  <div
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"
                    key={type.typeKey}
                  >
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {type.type}
                    </span>
                    <span className="mr-2 hidden text-xs text-muted-foreground/60 sm:inline">
                      {type.typeKey}
                    </span>
                    <DeleteTypeButton typeKey={type.typeKey} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CreateTypeRow() {
  const [type, setType] = useState("");
  const createType = useCreateAircraftType({ onSaved: () => setType("") });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!type.trim()) {
      return;
    }

    createType.execute({ type: type.trim() });
  }

  return (
    <div className="grid gap-2">
      <label
        className="text-sm font-semibold text-foreground"
        htmlFor="new-type-name"
      >
        Type name
        <span className="ml-1 text-secondary">*</span>
      </label>
      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <Input
          className="flex-1 border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/55"
          disabled={createType.isExecuting}
          id="new-type-name"
          onChange={(e) => setType(e.target.value)}
          placeholder="Cessna 172, Piper Archer, ..."
          value={type}
        />
        <Button disabled={createType.isExecuting || !type.trim()} type="submit">
          <PlusIcon className="size-4" />
          Add
        </Button>
      </form>
      <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
        <InfoIcon className="size-3.5 shrink-0" />
        Types cannot be edited after creation. Double-check before adding.
      </p>
    </div>
  );
}

function DeleteTypeButton({ typeKey }: { typeKey: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteType = useDeleteAircraftType({
    onDeleted: () => setConfirmOpen(false),
  });

  return (
    <>
      <Button
        className="size-8"
        disabled={deleteType.isExecuting}
        onClick={() => setConfirmOpen(true)}
        size="icon"
        type="button"
        variant="destructive"
      >
        <Trash2Icon className="size-3.5" />
      </Button>
      <ConfirmationDialog
        confirmLabel="Delete type"
        confirmingLabel="Deleting..."
        description="This action cannot be undone. Types assigned to one or more aircraft cannot be deleted."
        icon={Trash2Icon}
        isConfirming={deleteType.isExecuting}
        onConfirm={() => deleteType.execute({ typeKey })}
        onOpenChange={setConfirmOpen}
        open={confirmOpen}
        title="Delete aircraft type?"
      />
    </>
  );
}
