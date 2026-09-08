// Status colours shared by the dashboard boards and the public flight
// monitor: pill, row gradient, and the row separator tinted to the status
// so it doesn't read as a gap.
export type BoardStatus = "active" | "on_ground" | "arrived";

export const BOARD_STATUS_STYLES: Record<
  BoardStatus,
  {
    label: string;
    className: string;
    rowClassName: string;
    borderClassName: string;
  }
> = {
  active: {
    label: "Active",
    className: "border-emerald-200/50 bg-emerald-600/80 text-white",
    rowClassName:
      "bg-linear-to-r from-emerald-700/60 via-emerald-600/20 to-transparent",
    borderClassName: "border-emerald-300/35",
  },
  on_ground: {
    label: "On Ground",
    className: "border-orange-200/50 bg-orange-500/80 text-white",
    rowClassName:
      "bg-linear-to-r from-orange-700/60 via-orange-600/20 to-transparent",
    borderClassName: "border-orange-300/35",
  },
  arrived: {
    label: "Arrived",
    className: "border-yellow-200/60 bg-yellow-500/80 text-white",
    rowClassName:
      "bg-linear-to-r from-yellow-600/50 via-yellow-500/15 to-transparent",
    borderClassName: "border-yellow-300/35",
  },
};
