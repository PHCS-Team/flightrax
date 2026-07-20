"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import {
  CheckIcon,
  CircleHelpIcon,
  CopyIcon,
  EyeIcon,
  ImageIcon,
  ListFilterIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import { AircraftDeleteConfirmation } from "@/modules/aircrafts/components/aircraft-delete-confirmation";
import { AircraftFormDialog } from "@/modules/aircrafts/components/aircraft-form-dialog";
import { AircraftRemarksDialog } from "@/modules/aircrafts/components/aircraft-remarks-dialog";
import { AircraftStatusPill } from "@/modules/aircrafts/components/aircraft-status-pill";
import { AircraftTypeManager } from "@/modules/aircrafts/components/aircraft-type-manager";
import { AircraftWeightBalanceCell } from "@/modules/aircrafts/components/aircraft-weight-balance-cell";
import { useAircraftTypes } from "@/modules/aircrafts/hooks/use-aircraft-types.query";
import { useUpdateAircraftStatus } from "@/modules/aircrafts/hooks/use-update-aircraft-status.action";
import type { Aircraft, AircraftStatus } from "@/modules/aircrafts/types/aircraft";
import { useCopyToClipboard } from "@/shared/hooks/use-copy-to-clipboard";
import { toast } from "sonner";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

export function AircraftsTable({
  aircrafts,
  onPageChange,
  onSearchChange,
  onTypeFilterChange,
  page,
  pageSize,
  search,
  typeFilter,
  totalCount,
  totalPages,
}: {
  aircrafts: Aircraft[];
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onTypeFilterChange: (type: string) => void;
  page: number;
  pageSize: number;
  search: string;
  typeFilter: string;
  totalCount: number;
  totalPages: number;
}) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null);
  const [aircraftPendingDelete, setAircraftPendingDelete] =
    useState<Aircraft | null>(null);
  const [typeManagerOpen, setTypeManagerOpen] = useState(false);
  const [remarksAircraft, setRemarksAircraft] = useState<Aircraft | null>(null);
  const { aircraftTypes } = useAircraftTypes();
  const columns = useMemo<ColumnDef<Aircraft>[]>(
    () => [
      {
        id: "aircraft",
        header: "Aircraft",
        cell: ({ row }) => {
          const a = row.original;

          return (
            <div className="flex min-w-56 items-center gap-3">
              <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground shadow-sm">
                {a.photoUrl ? (
                  <div
                    aria-label={`${a.aircraftIdentification} aircraft image`}
                    className="absolute inset-0 bg-cover bg-center"
                    role="img"
                    style={{ backgroundImage: `url(${a.photoUrl})` }}
                  />
                ) : (
                  <ImageIcon className="size-5 text-primary-foreground/70" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-primary-foreground">
                    {a.aircraftIdentification}
                  </p>
                  <span className="inline-flex shrink-0 items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-1.5 py-0 text-[10px] font-medium leading-4 text-primary-foreground/75">
                    {a.typeName}
                  </span>
                </div>
                <p className="text-sm text-primary-foreground/65">{a.model}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-primary-foreground/50">
                    SRN: {a.serialNumber || "\u2014"}
                  </p>
                  {a.serialNumber && (
                    <SerialNumberCopy serial={a.serialNumber} />
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "colorMarkings",
        header: "Color / markings",
        cell: ({ row }) => (
          <p className="max-w-80 whitespace-normal text-sm text-primary-foreground/80 line-clamp-3">
            {row.original.colorMarkings}
          </p>
        ),
      },
      {
        id: "weightBalance",
        header: () => (
          <span className="inline-flex items-center gap-1">
            Weight & balance
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="-m-0.5 inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 text-primary-foreground/50 transition hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  type="button"
                >
                  <CircleHelpIcon className="size-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-64 p-3"
                side="bottom"
              >
                <div className="space-y-3">
                  <p className="text-xs font-medium text-foreground">
                    How to read weight &amp; balance
                  </p>
                  <div className="rounded-lg border bg-muted/30 p-2.5">
                    <p className="text-sm font-medium text-foreground/90">
                      Basic empty weight (lbs)
                    </p>
                    <p className="mt-0.5 text-xs text-foreground/60">
                      Arm (in) / Moment (lbs-in)
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        Basic empty weight
                      </span>
                      {" \u2014 "}Aircraft standard weight without payload or
                      fuel.
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        Arm
                      </span>
                      {" \u2014 "}Horizontal distance from datum in inches.
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        Moment
                      </span>
                      {" \u2014 "}Weight × arm in pound-inches.
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </span>
        ),
        cell: ({ row }) => (
          <div className="max-w-80">
            <AircraftWeightBalanceCell aircraft={row.original} />
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <StatusCell aircraft={row.original} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const a = row.original;

          return (
            <div className="flex min-w-28 flex-wrap gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:cursor-default"
                    onClick={() => setEditingAircraft(a)}
                    size="icon-sm"
                    type="button"
                    variant="outline"
                  >
                    <PencilIcon className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit aircraft</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:cursor-default"
                    onClick={() => setRemarksAircraft(a)}
                    size="icon-sm"
                    type="button"
                    variant="outline"
                  >
                    <EyeIcon className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View remarks</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="border-red-200/25 bg-red-200/10 text-red-100 hover:bg-red-200/15 hover:text-red-50 disabled:cursor-default"
                    onClick={() => setAircraftPendingDelete(a)}
                    size="icon-sm"
                    type="button"
                    variant="outline"
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete aircraft</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    [],
  );
  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize,
  };

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table exposes non-memoizable table helpers by design.
  const table = useReactTable({
    columns,
    data: aircrafts,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      onPageChange(next.pageIndex + 1);
    },
    state: { pagination },
  });

  return (
    <TooltipProvider>
      <GlassSurface className="space-y-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1">
            <Input
              className="max-w-sm border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/55 focus-visible:border-primary-foreground/45 focus-visible:ring-primary-foreground/20"
              onChange={(event) => {
                onSearchChange(event.target.value);
              }}
              placeholder="Search aircraft identification, model, or serial number"
              value={search}
            />
            <div className="relative">
              <Select
                onValueChange={(value) =>
                  onTypeFilterChange(value === "__all" ? "" : value)
                }
                value={typeFilter || "__all"}
              >
                <SelectTrigger
                  aria-label="Filter by type"
                  className={cn(
                    "h-10 w-full gap-1.5 border bg-primary-foreground/10 pl-2.5 pr-8 text-left text-sm font-medium capitalize transition hover:bg-primary-foreground/15 sm:w-36 *:data-[slot=select-value]:line-clamp-none",
                    typeFilter
                      ? "border-primary-foreground/30 text-primary-foreground"
                      : "border-primary-foreground/15 text-primary-foreground/70",
                  )}
                >
                  <ListFilterIcon
                    className={cn(
                      "size-4 shrink-0",
                      typeFilter
                        ? "text-primary-foreground"
                        : "text-primary-foreground/50",
                    )}
                  />
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className="capitalize">
                  <SelectItem value="__all">All types</SelectItem>
                  {aircraftTypes.map((type) => (
                    <SelectItem key={type.typeKey} value={type.typeKey}>
                      {type.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {typeFilter && (
                <button
                  aria-label="Clear type filter"
                  className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-primary-foreground/50 transition hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  onClick={() => onTypeFilterChange("")}
                  type="button"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <p className="text-sm text-primary-foreground/70">
              {aircrafts.length} of {totalCount} aircraft
            </p>
            <AircraftFormDialog
              onOpenChange={setCreateDialogOpen}
              open={createDialogOpen}
              trigger={
                <Button className="px-4 font-semibold" type="button">
                  <PlusIcon className="size-4" />
                  Add aircraft
                </Button>
              }
            />
            <Button
              className="border-primary-foreground/20 bg-primary-foreground/10 px-4 font-semibold text-primary-foreground hover:bg-primary-foreground/15"
              onClick={() => setTypeManagerOpen(true)}
              type="button"
              variant="outline"
            >
              <PencilIcon className="size-4" />
              Types
            </Button>
          </div>
        </div>

        <Table className="text-primary-foreground">
          <TableHeader className="[&_tr]:border-primary-foreground/20">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="border-primary-foreground/20 hover:bg-primary-foreground/5"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className="text-primary-foreground/75"
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="border-primary-foreground/10 hover:bg-primary-foreground/10"
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className="text-primary-foreground"
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-primary-foreground/70"
                  colSpan={columns.length}
                >
                  No aircraft match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-primary-foreground/70">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </p>
          <div className="flex gap-2">
            <Button
              className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:cursor-default disabled:border-primary-foreground/10 disabled:bg-primary-foreground/5 disabled:text-primary-foreground/50"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              type="button"
              variant="outline"
            >
              Previous
            </Button>
            <Button
              className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:cursor-default disabled:border-primary-foreground/10 disabled:bg-primary-foreground/5 disabled:text-primary-foreground/50"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              type="button"
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </GlassSurface>

      {editingAircraft && (
        <AircraftFormDialog
          aircraft={editingAircraft}
          onOpenChange={(open) => {
            if (!open) {
              setEditingAircraft(null);
            }
          }}
          open={Boolean(editingAircraft)}
        />
      )}

      <AircraftDeleteConfirmation
        aircraft={aircraftPendingDelete}
        onOpenChange={(open) => {
          if (!open) {
            setAircraftPendingDelete(null);
          }
        }}
        open={Boolean(aircraftPendingDelete)}
      />

      {remarksAircraft && (
        <AircraftRemarksDialog
          aircraftIdentification={remarksAircraft.aircraftIdentification}
          onOpenChange={(open) => {
            if (!open) {
              setRemarksAircraft(null);
            }
          }}
          open={Boolean(remarksAircraft)}
          remarks={remarksAircraft.remarks}
        />
      )}

      <AircraftTypeManager
        onOpenChange={setTypeManagerOpen}
        open={typeManagerOpen}
      />
    </TooltipProvider>
  );
}

function StatusCell({ aircraft }: { aircraft: Aircraft }) {
  const { executeAsync, isExecuting } = useUpdateAircraftStatus();
  const [optimisticStatus, setOptimisticStatus] =
    useState<AircraftStatus | null>(null);
  const displayStatus = optimisticStatus ?? aircraft.status;

  return (
    <AircraftStatusPill
      disabled={isExecuting}
      onChange={async (status) => {
        setOptimisticStatus(status);

        const result = await executeAsync({
          aircraftId: aircraft.id,
          status,
        });

        if (!result?.data?.ok) {
          setOptimisticStatus(null);
        }
      }}
      size="table"
      value={displayStatus}
      variant="glass"
    />
  );
}

function SerialNumberCopy({ serial }: { serial: string }) {
  const { copy, copied } = useCopyToClipboard();

  return (
    <button
      aria-label="Copy serial number"
      className="inline-flex cursor-pointer items-center justify-center rounded p-0.5 transition hover:bg-primary-foreground/10"
      onClick={async (e) => {
        e.stopPropagation();
        const ok = await copy(serial);

        if (ok) {
          toast.success("Serial number copied");
        }
      }}
      type="button"
    >
      {copied ? (
        <CheckIcon className="size-3 text-green-400" />
      ) : (
        <CopyIcon className="size-3 text-primary-foreground/40 hover:text-primary-foreground/70" />
      )}
    </button>
  );
}
