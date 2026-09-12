"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { useMemo } from "react";

import type {
  ScheduleCategory,
  ScheduleEntry,
  ScheduleStatus,
  ScheduleTableRow,
} from "@/modules/schedule/types/schedule";
import {
  SCHEDULE_CATEGORY_META,
  SCHEDULE_STATUS_META,
  categoryLabel,
} from "@/modules/schedule/utils/schedule-style";
import { Button } from "@/shared/components/ui/button";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

function ScheduleStatusBadge({ status }: { status: ScheduleStatus }) {
  const meta = SCHEDULE_STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center gap-1.5 rounded-4xl border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        meta.chip,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

function groupRows(entries: ScheduleEntry[]): ScheduleTableRow[] {
  const rows: ScheduleTableRow[] = [];
  let currentCategory: ScheduleCategory | null = null;

  for (const entry of entries) {
    if (entry.category !== currentCategory) {
      currentCategory = entry.category;
      rows.push({ kind: "group", category: currentCategory });
    }

    rows.push({ kind: "entry", entry });
  }

  return rows;
}

export function ScheduleTable({
  date,
  emptyMessage,
  entries,
  onPageChange,
  page,
  pageSize,
  title,
  totalCount,
  totalPages,
}: {
  date: string | null;
  emptyMessage: string;
  entries: ScheduleEntry[];
  onPageChange: (page: number) => void;
  page: number;
  pageSize: number;
  title: string;
  totalCount: number;
  totalPages: number;
}) {
  const rows = useMemo(() => groupRows(entries), [entries]);

  const columns = useMemo(
    () =>
      [
        {
          header: "ID",
          cell: ({ row }) =>
            row.original.kind === "entry" ? (
              <span className="font-mono text-primary-foreground">
                {row.original.entry.id}
              </span>
            ) : null,
        },
        {
          header: "Type",
          cell: ({ row }) =>
            row.original.kind === "entry"
              ? row.original.entry.type
              : null,
        },
        {
          header: "Registry",
          cell: ({ row }) =>
            row.original.kind === "entry" ? (
              <span className="font-medium text-primary-foreground">
                {row.original.entry.registry}
              </span>
            ) : null,
        },
        {
          header: "Time",
          cell: ({ row }) =>
            row.original.kind === "entry" ? (
              <span className="text-primary-foreground/80">
                {row.original.entry.time}
              </span>
            ) : null,
        },
        {
          header: "Legend",
          cell: ({ row }) =>
            row.original.kind === "entry" ? (
              <span className="text-primary-foreground/70">
                {row.original.entry.legend}
              </span>
            ) : null,
        },
        {
          header: "Status",
          cell: ({ row }) =>
            row.original.kind === "entry" ? (
              <ScheduleStatusBadge status={row.original.entry.status} />
            ) : null,
        },
      ] satisfies ColumnDef<ScheduleTableRow>[],
    [],
  );

  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize,
  };

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table exposes non-memoizable table helpers by design.
  const table = useReactTable({
    columns,
    data: rows,
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

  const columnCount = columns.length;

  return (
    <GlassSurface className="space-y-4 py-3 sm:py-4">
      <div className="flex flex-col gap-2 px-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-primary-foreground">
            {title}
          </h2>
          <p className="text-sm text-primary-foreground/65">
            {date ? `Schedules for ${date}` : `${totalCount} entries in view`}
          </p>
        </div>
        <p className="hidden text-sm text-primary-foreground/70 sm:block">
          {totalCount} {totalCount === 1 ? "entry" : "entries"}
        </p>
      </div>

      <Table className="text-primary-foreground">
        <TableHeader className="[&_tr]:border-primary-foreground/20">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              className="border-primary-foreground/20 hover:bg-primary-foreground/5"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  className={cn(
                    "text-primary-foreground/75",
                    index === 0 && "pl-4 sm:pl-6",
                    index === headerGroup.headers.length - 1 && "pr-4 sm:pr-6",
                  )}
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
            table.getRowModel().rows.map((row) => {
              const original = row.original;

              if (original.kind === "group") {
                const meta = SCHEDULE_CATEGORY_META[original.category];

                return (
                  <TableRow
                    className="border-primary-foreground/15 bg-primary-foreground/5"
                    key={row.id}
                  >
                    <TableCell className="px-4 py-2 sm:px-6" colSpan={columnCount}>
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/75">
                        <span
                          className={cn("size-2 rounded-full", meta.dot)}
                        />
                        {categoryLabel(original.category)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              }

              return (
                <TableRow
                  className="border-primary-foreground/10 hover:bg-primary-foreground/10"
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      className={cn(
                        "text-primary-foreground",
                        index === 0 && "pl-4 sm:pl-6",
                        index === row.getVisibleCells().length - 1 &&
                          "pr-4 sm:pr-6",
                      )}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                className="h-24 text-center text-primary-foreground/70"
                colSpan={columnCount}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 px-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p className="hidden text-sm text-primary-foreground/70 sm:block">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              type="button"
              variant="outline"
              className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:border-primary-foreground/10 disabled:bg-primary-foreground/5 disabled:text-primary-foreground/50"
            >
              Previous
            </Button>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              type="button"
              variant="outline"
              className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:border-primary-foreground/10 disabled:bg-primary-foreground/5 disabled:text-primary-foreground/50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </GlassSurface>
  );
}