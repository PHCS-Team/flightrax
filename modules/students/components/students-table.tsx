"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { useState } from "react";

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
import { CertificateTags } from "@/shared/components/certificate-tags";
import { CertificateDetailsDialog } from "@/shared/components/certificate-details-dialog";
import { LicenseTags } from "@/shared/components/license-tags";
import { LicenseDetailsDialog } from "@/shared/components/license-details-dialog";
import type { CertificateSummary } from "@/shared/types/certificate-summary";
import type { LicenseSummary } from "@/shared/types/license-summary";
import type { ApprovedStudent } from "@/modules/students/types/student";

export function StudentsTable({
  onPageChange,
  onSearchChange,
  page,
  pageSize,
  search,
  students,
  totalCount,
  totalPages,
}: {
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  page: number;
  pageSize: number;
  search: string;
  students: ApprovedStudent[];
  totalCount: number;
  totalPages: number;
}) {
  const [detailsLicense, setDetailsLicense] = useState<LicenseSummary | null>(
    null,
  );
  const [detailsCertificate, setDetailsCertificate] =
    useState<CertificateSummary | null>(null);
  const columns = [
    {
      accessorKey: "fullName",
      header: "Student Profile",
      cell: ({ row }) => {
        const student = row.original;

        return (
          <div className="flex min-w-64 items-center gap-3">
            <Avatar className="size-11" size="lg">
              {student.profilePhotoUrl && (
                <AvatarImage
                  alt={`${student.fullName} profile photo`}
                  src={student.profilePhotoUrl}
                />
              )}
              <AvatarFallback className="bg-primary-foreground/15 text-primary-foreground">
                {getAvatarFallback(student.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold text-primary-foreground">
                {student.fullName}
              </p>
              <p className="text-sm text-primary-foreground/65">
                ID Number: {student.studentIdNumber}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "licenses",
      header: "Licenses",
      cell: ({ row }) => (
        <LicenseTags
          licenses={row.original.licenses}
          onLicenseClick={setDetailsLicense}
        />
      ),
    },
    {
      id: "certificates",
      header: "Certificates",
      cell: ({ row }) => (
        <CertificateTags
          certificates={row.original.certificates}
          onCertificateClick={setDetailsCertificate}
        />
      ),
    },
  ] satisfies ColumnDef<ApprovedStudent>[];

  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize,
  };

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table exposes non-memoizable table helpers by design.
  const table = useReactTable({
    columns,
    data: students,
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
    <GlassSurface className="space-y-4 py-3 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2.5 sm:px-4">
        <Input
          className="max-w-sm border-primary-foreground/20 bg-primary-foreground/10 text-[#121212] placeholder:text-[#121212]/55 focus-visible:border-primary-foreground/45 focus-visible:ring-primary-foreground/20"
          onChange={(event) => {
            onSearchChange(event.target.value);
          }}
          placeholder="Search name, email, or student ID"
          value={search}
        />
        <p className="hidden sm:block text-sm text-primary-foreground/70">
          {students.length} of {totalCount} students
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
                No students match your search.
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
    </GlassSurface>
  );
}
