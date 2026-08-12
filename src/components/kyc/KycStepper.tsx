import React from "react";

export interface StepDescriptor {
  id: string;
  label: string;
  description: string;
}

export interface KycStepperProps {
  steps: StepDescriptor[];
  /** Index of the step being shown. */
  currentIndex: number;
  /** Allows jumping back to an already-completed step. */
  onNavigate?: (index: number) => void;
}

/**
 * Numbered progress indicator for the submission wizard.
 *
 * Completed steps stay clickable so a borrower can go back and correct an
 * answer without losing the rest of the form.
 */
export default function KycStepper({
  steps,
  currentIndex,
  onNavigate,
}: KycStepperProps) {
  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const clickable = done && Boolean(onNavigate);

        const marker = (
          <>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                done
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                  : active
                    ? "border-sky-500/60 bg-sky-500/15 text-sky-300"
                    : "border-white/10 bg-white/5 text-slate-500"
              }`}
            >
              {done ? "✓" : index + 1}
            </span>
            <span className="text-left">
              <span
                className={`block text-sm font-semibold ${
                  done ? "text-emerald-300" : active ? "text-white" : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
              <span className="block text-xs text-slate-500">{step.description}</span>
            </span>
          </>
        );

        return (
          <li key={step.id} className="flex flex-1 items-center gap-3">
            {clickable ? (
              <button
                type="button"
                onClick={() => onNavigate?.(index)}
                className="flex items-center gap-3 rounded-xl px-1 py-1 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                {marker}
              </button>
            ) : (
              <span
                className="flex items-center gap-3 px-1 py-1"
                aria-current={active ? "step" : undefined}
              >
                {marker}
              </span>
            )}

            {index < steps.length - 1 && (
              <span
                className={`hidden h-px flex-1 sm:block ${done ? "bg-emerald-500/40" : "bg-white/10"}`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
