"use client";

import { format } from "date-fns";
import { Trash2Icon } from "lucide-react";

import type { Notam } from "@/modules/notams/types/notam";
import { isNotamExpired } from "@/modules/notams/utils/notam-dates";
import { NOTAM_SEVERITY_META } from "@/shared/lib/aviation/notam-options";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

const PILL_CLASS =
  "inline-flex h-5 shrink-0 items-center rounded-full border px-2 text-[10px] font-medium uppercase tracking-wide";

export function NotamListItem({
  canDelete,
  isOwn,
  notam,
  onDelete,
}: {
  canDelete: boolean;
  isOwn: boolean;
  notam: Notam;
  onDelete: (notam: Notam) => void;
}) {
  const severity = NOTAM_SEVERITY_META[notam.severity];
  const expired = isNotamExpired(notam.expiresAt);

  return (
    <GlassSurface
      className={cn("p-3.5 sm:rounded-2xl sm:p-4", expired && "opacity-75")}
    >
      <header className="flex items-center gap-1.5">
        <span className={cn(PILL_CLASS, severity.className)}>
          {severity.label}
        </span>
        {isOwn && (
          <span
            className={cn(
              PILL_CLASS,
              "border-primary-foreground/40 bg-primary-foreground/20 text-primary-foreground",
            )}
          >
            You
          </span>
        )}
        {expired && (
          <span
            className={cn(
              PILL_CLASS,
              "border-primary-foreground/20 text-primary-foreground/70",
            )}
          >
            Expired
          </span>
        )}
        <span className="ml-auto shrink-0 text-[11px] text-primary-foreground/60">
          {format(new Date(notam.createdAt), "MMM d · h:mm a")}
        </span>
        {canDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Delete NOTAM"
                className="size-7 shrink-0 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-red-200"
                onClick={() => onDelete(notam)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete NOTAM</p>
            </TooltipContent>
          </Tooltip>
        )}
      </header>

      <h3 className="mt-2.5 line-clamp-2 text-sm font-semibold leading-snug text-primary-foreground sm:text-base">
        {notam.title}
      </h3>
      {notam.description && (
        <p className="mt-1 line-clamp-3 text-sm leading-5 text-primary-foreground/75">
          {notam.description}
        </p>
      )}

      <p className="mt-2.5 text-xs text-primary-foreground/60">
        Posted by{" "}
        <span className="font-semibold text-primary-foreground/85">
          {isOwn ? "you" : (notam.postedBy ?? "Unknown")}
        </span>
        {" · "}
        {expired ? "Expired" : "Expires"}{" "}
        <span className="font-semibold text-primary-foreground/85">
          {format(
            new Date(notam.expiresAt),
            "MMM d, yyyy",
          )}
        </span>
      </p>
    </GlassSurface>
  );
}
