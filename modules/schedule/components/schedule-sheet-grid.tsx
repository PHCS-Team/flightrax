"use client";

import type { CSSProperties } from "react";

import type { ScheduleSheetGrid as ScheduleSheetGridData } from "@/modules/schedule/types/schedule-upload";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { cn } from "@/shared/lib/utils";

const GRID_LINE = "border-[#d4d4d4]";

export function ScheduleSheetGrid({ grid }: { grid: ScheduleSheetGridData }) {
  const mergeByOrigin = new Map(
    grid.merges.map((merge) => [`${merge.r}:${merge.c}`, merge]),
  );
  const covered = new Set<string>();

  for (const merge of grid.merges) {
    for (let r = merge.r; r < merge.r + merge.rowSpan; r += 1) {
      for (let c = merge.c; c < merge.c + merge.colSpan; c += 1) {
        if (r !== merge.r || c !== merge.c) {
          covered.add(`${r}:${c}`);
        }
      }
    }
  }

  const gridStyle: CSSProperties = {
    gridTemplateColumns: grid.colWidths.map((width) => `${width}px`).join(" "),
    gridTemplateRows: grid.rowHeights.map((height) => `${height}px`).join(" "),
  };

  return (
    <GlassSurface className="overflow-hidden">
      <div className="scrollbar-none overflow-x-auto overscroll-x-contain">
        <div
          className="relative grid w-max min-w-full bg-white text-[11px] leading-tight text-[#121212]"
          style={gridStyle}
        >
          {grid.rowHeights.map((_, index) => (
            <div
              className={cn("border-b", GRID_LINE)}
              key={`row-${index}`}
              style={{ gridRow: index + 1, gridColumn: `1 / -1` }}
            />
          ))}
          {grid.colWidths.map((_, index) => (
            <div
              className={cn("border-r", GRID_LINE)}
              key={`col-${index}`}
              style={{ gridColumn: index + 1, gridRow: `1 / -1` }}
            />
          ))}
          {grid.cells.map((cell) => {
            const key = `${cell.r}:${cell.c}`;

            if (covered.has(key)) {
              return null;
            }

            const merge = mergeByOrigin.get(key);
            const style: CSSProperties = {
              gridRow: merge ? `${cell.r} / span ${merge.rowSpan}` : cell.r,
              gridColumn: merge ? `${cell.c} / span ${merge.colSpan}` : cell.c,
              backgroundColor: cell.fill,
              color: cell.color,
            };

            return (
              <div
                className={cn(
                  "z-10 flex items-center overflow-hidden border-r border-b px-1 py-0.5",
                  GRID_LINE,
                  cell.bold && "font-bold",
                  cell.italic && "italic",
                  cell.align === "center" && "justify-center text-center",
                  cell.align === "right" && "justify-end text-right",
                  cell.wrap ? "whitespace-pre-wrap" : "whitespace-pre",
                )}
                key={key}
                style={style}
              >
                {cell.v}
              </div>
            );
          })}
        </div>
      </div>
    </GlassSurface>
  );
}
