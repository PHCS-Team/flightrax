"use client";

import { Table, TableBody, TableHead, TableRow, TableCell } from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

interface InstructorAvailabilityRow {
  initial: string;
  fullName: string;
  isUnavailable: boolean;
}

export function InstructorAvailabilityTable({
  rows,
}: {
  rows: InstructorAvailabilityRow[];
}) {
  return (
    <Table className="w-full text-sm text-primary-foreground/60">
      <TableHead>
        <TableRow>
          <TableCell className="px-3 py-2 text-left font-medium uppercase tracking-wider text-xs text-primary-foreground/60">
            Initial
          </TableCell>
          <TableCell className="px-3 py-2 text-left">
            Instructor
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.fullName}
            className={cn(
              "border-b border-primary-foreground/10 hover:bg-primary-foreground/5",
              row.isUnavailable && "bg-primary-foreground/5 text-primary-foreground/90",
            )}
          >
            <TableCell className="px-3 py-2 font-medium">
              <span className={cn("text-primary-foreground", row.isUnavailable && "text-black")}>
                {row.initial}
              </span>
            </TableCell>
            <TableCell className="px-3 py-2">
              <span className={cn("text-primary-foreground", row.isUnavailable && "text-black")}>
                {row.fullName}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}