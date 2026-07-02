"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

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
import {
  getLicenseTypeLabel,
  getRatingLabel,
} from "@/shared/lib/aviation/license-options";
import { StudentLicenseEditDialog } from "@/modules/students/components/student-license-edit-dialog";
import type { ApprovedStudent } from "@/modules/students/types/student";

const columns = [
  {
    accessorKey: "fullName",
    header: "Student profile",
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
    id: "license",
    header: "License",
    cell: ({ row }) => {
      const student = row.original;
      const licenseType =
        getLicenseTypeLabel(student.licenseType) ?? student.licenseType;

      return (
        <div className="min-w-48">
          <p className="font-medium text-primary-foreground">
            {licenseType ?? "Not set"}
          </p>
          <p className="mt-1 text-sm text-primary-foreground/65">
            {student.licenseNumber
              ? `No. ${student.licenseNumber}`
              : "No license number"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) =>
      getRatingLabel(row.original.rating) ?? row.original.rating ?? "Not set",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <StudentLicenseEditDialog student={row.original} />,
  },
] satisfies ColumnDef<ApprovedStudent>[];

function matchesSearch(student: ApprovedStudent, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [
    student.fullName,
    student.studentIdNumber,
    student.licenseType,
    student.licenseNumber,
    student.rating,
  ]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLowerCase().includes(normalizedQuery));
}

export function StudentsTable({ students }: { students: ApprovedStudent[] }) {
  const [search, setSearch] = useState("");
  const filteredStudents = useMemo(
    () => students.filter((student) => matchesSearch(student, search)),
    [students, search],
  );
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table exposes non-memoizable table helpers by design.
  const table = useReactTable({
    columns,
    data: filteredStudents,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <GlassSurface className="space-y-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          className="max-w-sm border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/55 focus-visible:border-primary-foreground/45 focus-visible:ring-primary-foreground/20"
          onChange={(event) => {
            setSearch(event.target.value);
            table.setPageIndex(0);
          }}
          placeholder="Search name, ID, email, license, or rating"
          value={search}
        />
        <p className="text-sm text-primary-foreground/70">
          {filteredStudents.length} of {students.length} students
        </p>
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
                  <TableCell className="text-primary-foreground" key={cell.id}>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-primary-foreground/70">
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
    </GlassSurface>
  );
}
