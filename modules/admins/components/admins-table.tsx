"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { KeyRoundIcon } from "lucide-react";
import { useState } from "react";

import { AdminCredentialsDialog } from "@/modules/admins/components/admin-credentials-dialog";
import { useRegenerateAdminPassword } from "@/modules/admins/hooks/use-regenerate-admin-password.action";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import type { AdminCredentials } from "@/modules/admins/types/admin";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { getAvatarFallback } from "@/shared/lib/avatar-fallback";
import { ADMIN_DEPARTMENT_LABELS } from "@/shared/lib/rbac/config";
import { cn } from "@/shared/lib/utils";
import type { AdminAccount } from "@/modules/admins/types/admin";

export function AdminsTable({
  admins,
  onPageChange,
  onSearchChange,
  page,
  pageSize,
  search,
  totalCount,
  totalPages,
}: {
  admins: AdminAccount[];
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  page: number;
  pageSize: number;
  search: string;
  totalCount: number;
  totalPages: number;
}) {
  const [pendingRegenerate, setPendingRegenerate] =
    useState<AdminAccount | null>(null);
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null);
  const regeneratePassword = useRegenerateAdminPassword({
    onRegenerated: (regenerated) => {
      setPendingRegenerate(null);
      setCredentials(regenerated);
    },
  });
  const columns = [
    {
      accessorKey: "fullName",
      header: "Admin Profile",
      cell: ({ row }) => {
        const admin = row.original;

        return (
          <div className="flex min-w-64 items-center gap-3">
            <Avatar className="size-11" size="lg">
              {admin.profilePhotoUrl && (
                <AvatarImage
                  alt={`${admin.fullName} profile photo`}
                  src={admin.profilePhotoUrl}
                />
              )}
              <AvatarFallback className="bg-primary-foreground/15 text-primary-foreground">
                {getAvatarFallback(admin.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold text-primary-foreground">
                {admin.fullName}
              </p>
              <p className="truncate text-sm text-primary-foreground/65">
                {admin.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "department",
      header: "Department",
      cell: ({ row }) => {
        const department = row.original.department;

        return department ? (
          <span className="inline-flex items-center rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-2.5 py-0.5 text-sm text-primary-foreground whitespace-nowrap">
            {ADMIN_DEPARTMENT_LABELS[department]}
          </span>
        ) : (
          <span className="text-primary-foreground/50">No department</span>
        );
      },
    },
    {
      id: "password",
      header: "Password",
      cell: ({ row }) =>
        row.original.mustChangePassword ? (
          <span className="inline-flex items-center rounded-full border border-secondary/60 bg-secondary/25 px-2.5 py-0.5 text-sm text-primary-foreground whitespace-nowrap">
            Temp password
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-success/40 bg-success/20 px-2.5 py-0.5 text-sm text-primary-foreground whitespace-nowrap">
            Updated
          </span>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label={`Regenerate temp password for ${row.original.fullName}`}
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-primary-foreground/70 transition hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setPendingRegenerate(row.original)}
              type="button"
            >
              <KeyRoundIcon className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Regenerate Temp Password</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
  ] satisfies ColumnDef<AdminAccount>[];

  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize,
  };

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table exposes non-memoizable table helpers by design.
  const table = useReactTable({
    columns,
    data: admins,
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
    <GlassSurface className="space-y-3 sm:space-y-4 py-3 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2.5 sm:px-4">
        <Input
          className="max-w-sm border-primary-foreground/20 bg-primary-foreground/10 text-[#121212] placeholder:text-[#121212]/55 focus-visible:border-primary-foreground/45 focus-visible:ring-primary-foreground/20"
          onChange={(event) => {
            onSearchChange(event.target.value);
          }}
          placeholder="Search name or email"
          value={search}
        />
        <p className="hidden sm:block text-sm text-primary-foreground/70">
          {admins.length} of {totalCount} admins
        </p>
      </div>

      <Table className="text-primary-foreground">
        <TableHeader className="[&_tr]:border-primary-foreground/20">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              className="border-primary-foreground/20 hover:bg-primary"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  className={cn(
                    "bg-primary font-semibold text-primary-foreground",
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
                      index === row.getVisibleCells().length - 1 &&
                        "pr-4 sm:pr-6",
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
                No admins match your search.
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

      <ConfirmationDialog
        confirmLabel="Regenerate password"
        confirmingLabel="Regenerating..."
        description={`This replaces ${pendingRegenerate?.fullName ?? "this admin"}'s current password with a new temporary one — their old password stops working immediately, and you will get a new message to send them.`}
        icon={KeyRoundIcon}
        isConfirming={regeneratePassword.isExecuting}
        onConfirm={() => {
          if (pendingRegenerate) {
            regeneratePassword.execute({ adminId: pendingRegenerate.id });
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setPendingRegenerate(null);
          }
        }}
        open={Boolean(pendingRegenerate)}
        title="Regenerate Temp Password?"
      />

      {credentials && (
        <AdminCredentialsDialog
          credentials={credentials}
          onOpenChange={(open) => {
            if (!open) {
              setCredentials(null);
            }
          }}
          open
        />
      )}
    </GlassSurface>
    </TooltipProvider>
  );
}
