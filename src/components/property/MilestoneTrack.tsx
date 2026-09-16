import React from "react";
import type { Milestone, MortgageDetail } from "@/lib/api";
import { Badge, BadgeTone } from "@/components/ui/Badge";
import Address from "@/components/ui/Address";
import { formatUsdc, truncateHash } from "@/lib/format";

type StageState = "released" | "verified" | "evidence" | "open" | "blocked";

const STATE_META: Record<StageState, { label: string; tone: BadgeTone; hint: string }> = {
  released: { label: "Tranche released", tone: "emerald", hint: "Signed off and paid to the trustee." },
  verified: {
    label: "Signed off",
    tone: "sky",
    hint: "An inspector has signed off. Anyone may now release the tranche.",
  },
  evidence: {
    label: "Evidence submitted",
    tone: "amber",
    hint: "Waiting for an inspector to sign off.",
  },
  open: { label: "Awaiting evidence", tone: "slate", hint: "The trustee has not submitted evidence yet." },
  blocked: {
    label: "Not started",
    tone: "slate",
    hint: "Stages are signed off in order; the previous stage comes first.",
  },
};

export function stageState(milestones: Milestone[], stage: number): StageState {
  const m = milestones[stage];
  if (m.released) return "released";
  if (m.verified) return "verified";
  if (m.evidenceHash) return "evidence";
  if (stage > 0 && !milestones[stage - 1].verified) return "blocked";
  return "open";
}

/**
 * The five construction stages, in order. `renderActions` adds per-stage
 * controls (submit evidence, sign off, release) for whoever may use them,
 * including their own divider; it renders nothing when there are none.
 */
export default function MilestoneTrack({
  milestones,
  tranches,
  renderActions,
}: {
  milestones: Milestone[];
  tranches?: MortgageDetail["tranches"];
  renderActions?: (milestone: Milestone, state: StageState) => React.ReactNode;
}) {
  return (
    <ol className="relative space-y-3">
      {milestones.map((m) => {
        const state = stageState(milestones, m.stage);
        const meta = STATE_META[state];
        const actions = renderActions?.(m, state);
        const done = state === "released" || state === "verified";
        return (
          <li key={m.stage} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                  state === "released"
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                    : done
                      ? "border-sky-500 bg-sky-500/20 text-sky-300"
                      : state === "evidence"
                        ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                        : "border-white/15 text-slate-500"
                }`}
              >
                {done ? "✓" : m.stage + 1}
              </span>
              {m.stage < milestones.length - 1 && (
                <span className={`mt-1 w-px flex-1 ${done ? "bg-sky-500/40" : "bg-white/10"}`} />
              )}
            </div>
            <div className="min-w-0 flex-1 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-bold text-white">{m.name}</h3>
                  {tranches && (
                    <span className="text-sm text-slate-400">{formatUsdc(tranches[m.stage]?.amount)}</span>
                  )}
                </div>
                <Badge tone={meta.tone} dot title={meta.hint}>
                  {meta.label}
                </Badge>
              </div>
              <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs text-slate-400 sm:grid-cols-2">
                <div className="flex min-w-0 gap-1.5">
                  <dt>Evidence</dt>
                  <dd className="min-w-0 truncate font-mono text-slate-300" title={m.evidenceHash ?? undefined}>
                    {m.evidenceHash ? truncateHash(m.evidenceHash, 8, 8) : "—"}
                  </dd>
                </div>
                {m.verifiedBy && (
                  <div className="flex min-w-0 items-center gap-1.5">
                    <dt>Signed off by</dt>
                    <dd className="min-w-0">
                      <Address value={m.verifiedBy} />
                    </dd>
                  </div>
                )}
              </dl>
              {actions}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
