"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

export interface TimeGridEntry {
  key: string;
  id: string;
  type: string;
  registry: string;
  time: string;
  legend: string;
  status: string;
  startTimeUtc: string | null;
}

const TIME_SLOTS = [
  { label: "6-7am", start: 6, end: 7 },
  { label: "7-8am", start: 7, end: 8 },
  { label: "8-9am", start: 8, end: 9 },
  { label: "9-10am", start: 9, end: 10 },
  { label: "10-11am", start: 10, end: 11 },
  { label: "11-12pm", start: 11, end: 12 },
  { label: "12-1pm", start: 12, end: 13 },
  { label: "1-2pm", start: 13, end: 14 },
  { label: "2-3pm", start: 14, end: 15 },
  { label: "3-4pm", start: 15, end: 16 },
  { label: "4-5pm", start: 16, end: 17 },
  { label: "5-6pm", start: 17, end: 18 },
  { label: "6-7pm", start: 18, end: 19 },
  { label: "7-8pm", start: 19, end: 20 },
  { label: "8-9pm", start: 20, end: 21 },
  { label: "9-10pm", start: 21, end: 22 },
  { label: "10-11pm", start: 22, end: 23 },
  { label: "11-12am", start: 23, end: 24 },
];

function parseTimeSlot(timeStr: string | null): { start: number; end: number } | null {
  if (!timeStr) return null;
  const hour = parseInt(timeStr.slice(0, 2), 10);
  if (isNaN(hour)) return null;
  return { start: hour, end: hour + 1 };
}

function getMatchingSlots(entryStart: number, entryEnd: number): string[] {
  return TIME_SLOTS
    .filter((slot) => slot.start >= entryStart && slot.end <= entryEnd)
    .map((slot) => slot.label);
}

export function ScheduleTimeGrid({
  entries,
  emptyMessage = "No schedules for this period.",
}: {
  entries: TimeGridEntry[];
  emptyMessage?: string;
}) {
  const grouped = new Map<string, TimeGridEntry[]>();

  for (const entry of entries) {
    const key = `${entry.type}|${entry.registry}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  const rows = Array.from(grouped.entries()).map(([_key, items]) => {
    const first = items[0];
    const slotMap = new Map<string, TimeGridEntry>();

    for (const item of items) {
      const parsed = parseTimeSlot(item.startTimeUtc);
      if (parsed) {
        const slots = getMatchingSlots(parsed.start, parsed.end);
        for (const slot of slots) {
          slotMap.set(slot, item);
        }
      }
    }

    return { type: first.type, registry: first.registry, slots: slotMap };
  });

  return (
    <div className="overflow-x-auto">
      <Table className="w-full text-xs text-primary-foreground">
        <TableHeader className="[&_th]:border-primary-foreground/20">
          <TableRow>
            <TableHead className="w-28 px-2 py-1.5 text-left font-medium uppercase tracking-wider text-primary-foreground/60 border-b border-primary-foreground/20">
              Type
            </TableHead>
            <TableHead className="w-36 px-2 py-1.5 text-left font-medium uppercase tracking-wider text-primary-foreground/60 border-b border-primary-foreground/20">
              Registry
            </TableHead>
            {TIME_SLOTS.map((slot) => (
              <TableHead key={slot.label} className="w-16 px-1.5 py-1.5 text-center font-medium uppercase tracking-wider text-primary-foreground/60 border-b border-primary-foreground/20">
                {slot.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={TIME_SLOTS.length + 2} className="h-24 text-center text-primary-foreground/60">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={`${row.type}|${row.registry}`} className="border-b border-primary-foreground/10 hover:bg-primary-foreground/5">
                <TableCell className="px-2 py-1.5 font-medium text-primary-foreground w-28">
                  {row.type}
                </TableCell>
                <TableCell className="px-2 py-1.5 text-primary-foreground/80 w-36 truncate">
                  {row.registry}
                </TableCell>
                {TIME_SLOTS.map((slot) => {
                  const entry = row.slots.get(slot.label);
                  const occupied = !!entry;
                  return (
                    <TableCell key={slot.label} className={cn(
                      "w-16 px-1.5 py-1.5 text-center border-l border-primary-foreground/10",
                      occupied && "bg-primary-foreground/10"
                    )}>
                      {occupied && (
                        <span className={cn(
                          "inline-flex items-center justify-center w-full h-full rounded border text-[0.55rem] font-medium",
                          entry.status === "approved" && "bg-emerald-500/20 border-emerald-500/40 text-emerald-600",
                          entry.status === "pending_approval" && "bg-amber-500/20 border-amber-500/40 text-amber-600",
                          entry.status === "unavailable" && "bg-rose-500/20 border-rose-500/40 text-rose-600",
                          entry.status === "maintenance" && "bg-sky-500/20 border-sky-500/40 text-sky-600",
                        )}>
                          {entry.id.slice(0, 6)}
                        </span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}