import React from "react";
import { clampPercent } from "@/lib/format";

const TONE_CLASSES = {
  sky: "from-sky-500 to-sky-400",
  emerald: "from-emerald-500 to-emerald-400",
  gradient: "from-sky-500 via-teal-400 to-emerald-400",
  amber: "from-amber-500 to-amber-400",
  slate: "from-slate-600 to-slate-500",
} as const;

const SIZE_CLASSES = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
} as const;

export interface ProgressBarProps {
  /** Completion percentage, 0-100. Values outside the range are clamped. */
  value: number;
  tone?: keyof typeof TONE_CLASSES;
  size?: keyof typeof SIZE_CLASSES;
  /** Accessible name, e.g. "Escrow released". */
  label: string;
  /** Adds subtle diagonal stripes to signal live, in-flight progress. */
  striped?: boolean;
  className?: string;
}

/** Horizontal progress meter used for escrow release and build completion. */
export default function ProgressBar({
  value,
  tone = "gradient",
  size = "md",
  label,
  striped = false,
  className = "",
}: ProgressBarProps) {
  const percent = clampPercent(value);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full overflow-hidden rounded-full bg-slate-800/80 ${SIZE_CLASSES[size]} ${className}`}
    >
      <div
        className={`h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out ${TONE_CLASSES[tone]}`}
        style={{
          width: `${percent}%`,
          ...(striped
            ? {
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 6px, transparent 6px 12px)",
              }
            : {}),
        }}
      />
    </div>
  );
}
