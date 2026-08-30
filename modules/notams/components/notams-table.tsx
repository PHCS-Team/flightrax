"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";

import { Button } from "@/shared/components/ui/button";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Input } from "@/shared/components/ui/input";
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
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon, Edit2Icon, Trash2Icon, XIcon } from "lucide-react";
import type { Notam } from "@/modules/notams/types/notam";
import { NotamDeleteConfirmation } from "@/modules/notams/components/notam-delete-confirmation";
import { NotamEditDialog } from "@/modules/notams/components/notam-edit-dialog";

const SEVERITY_STYLES = {
  advisory: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  alert: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
} as const;

type SeverityFilter = "" | "advisory" | "warning" | "alert";
type ExpiryFilter = "" | "active" | "expired" | "no_expiry";

function formatDate(dateString: string | null): string {
  if (!dateString) return "No expiration";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function SeverityBadge({ severity }: { severity: "advisory" | "warning" | "alert" }) {
  return (
    <Badge className={SEVERITY_STYLES[severity]} variant="secondary">
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
}

export function NotamsTable({
  onPageChange,
  onSearchChange,
  onSeverityFilterChange,
  onExpiryFilterChange,
  page,
  pageSize,
  search,
  severityFilter,
  expiryFilter,
  notams,
  totalCount,
  totalPages,
  hasActiveFilters,
  onClearFilters,
}: {
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onSeverityFilterChange: (severity: SeverityFilter) => void;
  onExpiryFilterChange: (expiry: ExpiryFilter) => void;
  page: number;
  pageSize: number;
  search: string;
  severityFilter: SeverityFilter;
  expiryFilter: ExpiryFilter;
  notams: Notam[];
  totalCount: number;
  totalPages: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  const [editingNotam, setEditingNotam] = useState<Notam | null>(null);
  const [notamPendingDelete, setNotamPendingDelete] = useState<Notam | null>(null);

  const columns: ColumnDef<Notam>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium text-primary-foreground truncate max-w-[300px]">
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-primary-foreground text-sm">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: "Expires",
      cell: ({ row }) => (
        <span className="text-primary-foreground text-sm">{formatDate(row.original.expiresAt)}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-primary-foreground/70 text-sm truncate max-w-[400px]">
          {row.original.description ?? "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingNotam(row.original)}
            className="text-primary-foreground/70 hover:text-primary-foreground"
            aria-label="Edit NOTAM"
          >
            <Edit2Icon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotamPendingDelete(row.original)}
            className="text-primary-foreground/70 hover:text-destructive"
            aria-label="Delete NOTAM"
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize,
  };

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table exposes non-memoizable table helpers by design.
  const table = useReactTable({
    columns,
    data: notams,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      onPageChange(next.pageIndex + 1);
    },
    state: { pagination },
  });

  return (
    <GlassSurface className="space-y-4 py-3 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2.5 sm:px-4">
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <Input
            className="max-w-sm border-primary-foreground/20 bg-primary-foreground/10 text-[#121212] placeholder:text-[#121212]/55 focus-visible:border-primary-foreground/45 focus-visible:ring-primary-foreground/20 flex-1 min-w-[200px]"
            onChange={(event) => {
              onSearchChange(event.target.value);
            }}
            placeholder="Search title or description"
            value={search}
          />

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
            <div className="w-full sm:w-40">
              <Select
                value={severityFilter}
                onValueChange={(value) => onSeverityFilterChange(value as SeverityFilter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="advisory">Advisory</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-40">
              <Select
                value={expiryFilter}
                onValueChange={(value) => onExpiryFilterChange(value as ExpiryFilter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="no_expiry">No Expiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="w-full sm:w-auto text-primary-foreground/70 hover:text-primary-foreground gap-1 border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/15"
            >
              <XIcon className="size-3.5" />
              Clear filters
            </Button>
          )}
        </div>

        <p className="hidden sm:block text-sm text-primary-foreground/70">
          {notams.length} of {totalCount} NOTAMs
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
                    : flexRender(header.column.columnDef.header, header.getContext())}
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
                {row.getVisibleCells().map((cell, index) => (
                  <TableCell
                    className={cn(
                      "text-primary-foreground",
                      index === 0 && "pl-4 sm:pl-6",
                      index === row.getVisibleCells().length - 1 && "pr-4 sm:pr-6",
                    )}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                No NOTAMs match your search.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2.5 sm:px-4">
        <p className="hidden sm:block text-sm text-primary-foreground/70">
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
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            type="button"
            variant="outline"
            className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:border-primary-foreground/10 disabled:bg-primary-foreground/5 disabled:text-primary-foreground/50"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      <NotamEditDialog
        notam={editingNotam}
        onOpenChange={(open) => {
          if (!open) setEditingNotam(null);
        }}
        open={!!editingNotam}
        onSuccess={() => setEditingNotam(null)}
      />

      <NotamDeleteConfirmation
        notam={notamPendingDelete}
        onOpenChange={(open) => {
          if (!open) setNotamPendingDelete(null);
        }}
        open={!!notamPendingDelete}
      />
    </GlassSurface>
  );
}