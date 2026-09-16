import React from "react";

const ACCENTS = {
  sky: "text-sky-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  white: "text-white",
} as const;

export interface StatTileProps {
  label: string;
  value: string;
  /** Secondary line under the value, e.g. where the number comes from. */
  hint?: string;
  accent?: keyof typeof ACCENTS;
  /** Optional trailing slot for a badge or mini progress bar. */
  footer?: React.ReactNode;
}

/** Single headline figure in the dashboard's summary row. */
export default function StatTile({
  label,
  value,
  hint,
  accent = "white",
  footer,
}: StatTileProps) {
  return (
    <div className="glass-panel flex flex-col justify-between gap-3 rounded-3xl p-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {label}
        </p>
        <p className={`text-2xl font-extrabold ${ACCENTS[accent]}`}>{value}</p>
        {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
      </div>
      {footer}
    </div>
  );
}
