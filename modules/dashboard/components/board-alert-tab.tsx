export function BoardAlertTab({
  description,
  label,
}: {
  description: string;
  label: string;
}) {
  return (
    <span
      aria-label={`${label} — ${description}`}
      className="pointer-events-none absolute right-0 top-0 z-10 inline-flex items-center gap-1 rounded-bl-lg border-b border-l border-red-200/40 bg-red-700/80 py-0.5 pl-1.5 pr-2 text-[9px] font-bold uppercase leading-none tracking-wider text-red-50 shadow-sm backdrop-blur-sm"
      role="img"
    >
      <span aria-hidden className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-300 opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-red-200" />
      </span>
      {label}
    </span>
  );
}

export function DelayedTab() {
  return (
    <BoardAlertTab
      description="scheduled departure time has passed"
      label="Delayed"
    />
  );
}

export function PastEetTab() {
  return (
    <BoardAlertTab
      description="airborne longer than the filed estimated elapsed time"
      label="Past EET"
    />
  );
}
