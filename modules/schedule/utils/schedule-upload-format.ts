import { formatDateLabel } from "@/modules/schedule/utils/schedule-time";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// "Sep 15" for a one-day file, "Sep 15 - 19" inside a month, "Sep 29 - Oct 3"
// across months.
export function formatUploadRange(startsOn: string, endsOn: string): string {
  if (startsOn === endsOn) {
    return formatDateLabel(startsOn, "MMM d");
  }

  if (startsOn.slice(0, 7) === endsOn.slice(0, 7)) {
    return `${formatDateLabel(startsOn, "MMM d")} - ${formatDateLabel(endsOn, "d")}`;
  }

  return `${formatDateLabel(startsOn, "MMM d")} - ${formatDateLabel(endsOn, "MMM d")}`;
}

// Calendar chips fall back to the file name without its extension.
export function uploadDisplayName(upload: {
  label: string | null;
  fileName: string;
}): string {
  return upload.label ?? upload.fileName.replace(/\.xlsx$/i, "");
}

const CHIP_CLASSES = [
  "bg-sky-300 text-sky-950",
  "bg-emerald-300 text-emerald-950",
  "bg-amber-300 text-amber-950",
  "bg-violet-300 text-violet-950",
  "bg-rose-300 text-rose-950",
  "bg-teal-300 text-teal-950",
];

export function uploadChipClass(index: number): string {
  return CHIP_CLASSES[index % CHIP_CLASSES.length];
}
