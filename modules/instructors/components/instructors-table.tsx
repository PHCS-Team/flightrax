"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { CalendarOffIcon } from "lucide-react";
import { useState } from "react";

import { ManageAvailabilityDialog } from "@/modules/instructors/components/manage-availability-dialog";
import {
  getAvailabilityStatusLabel,
  getInstructorAvailabilityStatus,
} from "@/modules/instructors/utils/availability";

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
import { cn } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { CertificateTags } from "@/shared/components/certificate-tags";
import { CertificateDetailsDialog } from "@/shared/components/certificate-details-dialog";
import { LicenseTags } from "@/shared/components/license-tags";
import { LicenseDetailsDialog } from "@/shared/components/license-details-dialog";
import type { CertificateSummary } from "@/shared/types/certificate-summary";
import type { LicenseSummary } from "@/shared/types/license-summary";
import type { ApprovedInstructor } from "@/modules/instructors/types/instructor";

export function InstructorsTable({
  canManageAvailability,
  instructors,
  onPageChange,
  onSearchChange,
  page,
  pageSize,
  restrictPeerCredentials,
  search,
  totalCount,
  totalPages,
  viewerId,
}: {
  canManageAvailability: boolean;
  instructors: ApprovedInstructor[];
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  page: number;
  pageSize: number;
  restrictPeerCredentials: boolean;
  search: string;
  totalCount: number;
  totalPages: number;
  viewerId: string | null;
}) {
  const [detailsLicense, setDetailsLicense] = useState<LicenseSummary | null>(
    null,
  );
  const [detailsCertificate, setDetailsCertificate] =
    useState<CertificateSummary | null>(null);
  const [availabilityInstructorId, setAvailabilityInstructorId] = useState<
    string | null
  >(null);
  const availabilityInstructor =
    instructors.find(
      (instructor) => instructor.id === availabilityInstructorId,
    ) ?? null;

  function canViewCredentials(instructor: ApprovedInstructor) {
    return !restrictPeerCredentials || instructor.id === viewerId;
  }

  function isCurrentlyUnavailable(instructor: ApprovedInstructor) {
    return (
      getInstructorAvailabilityStatus(instructor.unavailabilities).kind ===
      "unavailable"
    );
  }

  const columns = [
    {
      accessorKey: "fullName",
      header: "Instructor Profile",
      cell: ({ row }) => {
        const instructor = row.original;

        return (
          <div className="flex min-w-64 items-center gap-3">
            <Avatar className="size-11" size="lg">
              {instructor.profilePhotoUrl && (
                <AvatarImage
                  alt={`${instructor.fullName} profile photo`}
                  src={instructor.profilePhotoUrl}
                />
              )}
              <AvatarFallback className="bg-primary-foreground/15 text-primary-foreground">
                {getAvatarFallback(instructor.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold text-primary-foreground">
                {instructor.fullName}
              </p>
              <p className="text-sm text-primary-foreground/65">
                ID Number: {instructor.instructorIdNumber}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = getInstructorAvailabilityStatus(
          row.original.unavailabilities,
        );

        return (
          <span
            className={cn(
              "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
              status.kind === "unavailable"
                ? "border-red-200/40 bg-red-700/70 text-red-50"
                : status.kind === "upcoming"
                  ? "border-amber-200/50 bg-amber-500/20 text-amber-100"
                  : "border-emerald-200/40 bg-emerald-600/20 text-emerald-100",
            )}
          >
            {getAvailabilityStatusLabel(status)}
          </span>
        );
      },
    },
    {
      id: "licenses",
      header: "Licenses",
      cell: ({ row }) => (
        <LicenseTags
          licenses={row.original.licenses}
          onLicenseClick={
            canViewCredentials(row.original) ? setDetailsLicense : undefined
          }
          tone={
            isCurrentlyUnavailable(row.original) ? "destructive" : "default"
          }
        />
      ),
    },
    {
      id: "certificates",
      header: "Certificates",
      cell: ({ row }) => (
        <CertificateTags
          certificates={row.original.certificates}
          onCertificateClick={
            canViewCredentials(row.original) ? setDetailsCertificate : undefined
          }
          tone={
            isCurrentlyUnavailable(row.original) ? "destructive" : "default"
          }
        />
      ),
    },
    ...(canManageAvailability
      ? [
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label="Manage availability"
                    className="size-8 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                    onClick={() => setAvailabilityInstructorId(row.original.id)}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <CalendarOffIcon className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Manage Availability</p>
                </TooltipContent>
              </Tooltip>
            ),
          } satisfies ColumnDef<ApprovedInstructor>,
        ]
      : []),
  ] satisfies ColumnDef<ApprovedInstructor>[];

  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize,
  };

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table exposes non-memoizable table helpers by design.
  const table = useReactTable({
    columns,
    data: instructors,
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
      <GlassSurface className="space-y-4 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2.5 sm:px-4">
          <Input
            className="max-w-sm border-primary-foreground/20 bg-primary-foreground/10 text-[#121212] placeholder:text-[#121212]/55 focus-visible:border-primary-foreground/45 focus-visible:ring-primary-foreground/20"
            onChange={(event) => {
              onSearchChange(event.target.value);
            }}
            placeholder="Search name, email, or instructor ID"
            value={search}
          />
          <p className="hidden sm:block text-sm text-primary-foreground/70">
            {instructors.length} of {totalCount} instructors
          </p>
        </div>

        <Table className="text-primary-foreground p-0">
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
                      index === headerGroup.headers.length - 1 &&
                        "pr-4 sm:pr-6",
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
                  className={cn(
                    "border-primary-foreground/10 hover:bg-primary-foreground/10",
                    isCurrentlyUnavailable(row.original) &&
                      "bg-red-500/10 hover:bg-red-500/15",
                  )}
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-primary-foreground/70"
                  colSpan={columns.length}
                >
                  No instructors match your search.
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

        {detailsLicense && (
          <LicenseDetailsDialog
            license={detailsLicense}
            onOpenChange={(open) => {
              if (!open) {
                setDetailsLicense(null);
              }
            }}
            open
          />
        )}

        {detailsCertificate && (
          <CertificateDetailsDialog
            certificate={detailsCertificate}
            onOpenChange={(open) => {
              if (!open) {
                setDetailsCertificate(null);
              }
            }}
            open
          />
        )}

        {availabilityInstructor && (
          <ManageAvailabilityDialog
            instructor={availabilityInstructor}
            onOpenChange={(open) => {
              if (!open) {
                setAvailabilityInstructorId(null);
              }
            }}
            open
          />
        )}
      </GlassSurface>
    </TooltipProvider>
  );
}
