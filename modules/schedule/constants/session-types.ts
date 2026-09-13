export const SCHEDULE_SESSION_TYPES = [
  "ps",
  "taxi",
  "lcl",
  "xc",
  "irs",
  "caap",
  "cf",
  "ots",
  "tbd",
  "ct",
  "uprt",
] as const;

export type ScheduleSessionType = (typeof SCHEDULE_SESSION_TYPES)[number];

export type ScheduleSessionTypeMeta = {
  code: string;
  label: string;
  className: string;
  needsPeople: boolean;
};

export const SCHEDULE_SESSION_TYPE_META: Record<
  ScheduleSessionType,
  ScheduleSessionTypeMeta
> = {
  ps: {
    code: "PS",
    label: "Pre-Solo Simulator",
    className: "bg-violet-300/80 text-violet-950",
    needsPeople: true,
  },
  taxi: {
    code: "TAXI",
    label: "Taxi Exercise",
    className: "bg-amber-900/65 text-amber-50",
    needsPeople: true,
  },
  lcl: {
    code: "LCL",
    label: "Local Flight",
    className: "bg-yellow-200/85 text-yellow-950",
    needsPeople: true,
  },
  xc: {
    code: "XC",
    label: "Cross Country Flight",
    className: "bg-sky-300/80 text-sky-950",
    needsPeople: true,
  },
  irs: {
    code: "IRS",
    label: "Instrument Simulator",
    className: "bg-orange-300/80 text-orange-950",
    needsPeople: true,
  },
  caap: {
    code: "CAAP",
    label: "CAAP Checkride",
    className: "bg-lime-300/80 text-lime-950",
    needsPeople: true,
  },
  cf: {
    code: "CF",
    label: "Company Flight",
    className: "bg-emerald-300/80 text-emerald-950",
    needsPeople: true,
  },
  ots: {
    code: "OTS",
    label: "Out of Service",
    className: "bg-red-950/70 text-red-50",
    needsPeople: false,
  },
  tbd: {
    code: "TBD",
    label: "To Be Determined",
    className: "bg-slate-100/90 text-slate-900",
    needsPeople: false,
  },
  ct: {
    code: "CT",
    label: "Cross Trainees",
    className: "bg-amber-400/75 text-amber-950",
    needsPeople: true,
  },
  uprt: {
    code: "UPRT",
    label: "Upset Prevention and Recovery Training",
    className: "bg-rose-400/75 text-rose-950",
    needsPeople: true,
  },
};

const KNOWN = new Set<string>(SCHEDULE_SESSION_TYPES);

export function isScheduleSessionType(
  value: string,
): value is ScheduleSessionType {
  return KNOWN.has(value);
}
