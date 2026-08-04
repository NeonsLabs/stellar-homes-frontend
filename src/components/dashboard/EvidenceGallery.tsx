"use client";

import React, { useCallback, useEffect, useId, useState } from "react";
import Modal from "./Modal";
import { Badge } from "./StatusBadge";
import { formatDate, truncateHash } from "@/lib/format";
import type { MilestoneEvidence } from "@/types/dashboard";

/**
 * Deterministic tint for an evidence tile.
 *
 * The photos themselves live on IPFS; until the gateway URL is wired up these
 * tiles stand in for them, derived from the record's stable `hue` so the same
 * proof always renders the same way on the server and the client.
 */
function tileStyle(hue: number): React.CSSProperties {
  return {
    backgroundImage: `linear-gradient(135deg, hsl(${hue} 52% 28%) 0%, hsl(${(hue + 34) % 360} 46% 15%) 60%, hsl(${(hue + 60) % 360} 40% 11%) 100%)`,
  };
}

const BLUEPRINT_OVERLAY: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 22px), repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 22px)",
};

function CameraIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M3 9a2 2 0 012-2h1.5l1-2h7l1 2H21a0 0 0 010 0 2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <circle cx="12" cy="13" r="3.2" strokeWidth="1.8" />
    </svg>
  );
}

/** Single clickable proof tile. */
function EvidenceThumb({
  evidence,
  onOpen,
}: {
  evidence: MilestoneEvidence;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 text-left transition-all hover:-translate-y-0.5 hover:border-sky-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      style={tileStyle(evidence.hue)}
      aria-label={`View proof: ${evidence.caption}, captured ${formatDate(evidence.capturedAt)}`}
    >
      <span className="absolute inset-0" style={BLUEPRINT_OVERLAY} aria-hidden="true" />
      <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" aria-hidden="true" />

      <span className="absolute top-2 left-2 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-slate-300 backdrop-blur-sm">
        IPFS
      </span>
      <span className="absolute top-2 right-2 text-white/70 transition-colors group-hover:text-white">
        <CameraIcon className="h-4 w-4" />
      </span>

      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-3">
        <span className="line-clamp-2 text-xs leading-snug font-semibold text-white">
          {evidence.caption}
        </span>
        <span className="text-[10px] text-slate-300">
          {formatDate(evidence.capturedAt)}
        </span>
      </span>
    </button>
  );
}

export interface EvidenceGalleryProps {
  evidence: MilestoneEvidence[];
  /** Milestone the proofs belong to, shown as context in the viewer. */
  milestoneTitle: string;
}

/**
 * Grid of construction proof photos with a full-screen viewer.
 *
 * The viewer supports arrow-key navigation across the milestone's proofs and
 * exposes the raw IPFS CID so the borrower can verify it independently.
 */
export default function EvidenceGallery({
  evidence,
  milestoneTitle,
}: EvidenceGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Tracked by CID rather than a boolean so paging to another proof clears the
  // confirmation without needing a reset effect.
  const [copiedCid, setCopiedCid] = useState<string | null>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setActiveIndex(null);
    setCopiedCid(null);
  }, []);

  const step = useCallback(
    (delta: number) =>
      setActiveIndex((current) =>
        current === null
          ? current
          : (current + delta + evidence.length) % evidence.length,
      ),
    [evidence.length],
  );

  // Arrow keys page through the proofs while the viewer is open.
  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, step]);

  if (evidence.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
        <CameraIcon className="mx-auto mb-2 h-6 w-6 text-slate-600" />
        <p className="text-sm text-slate-400">No site photos submitted yet</p>
        <p className="mt-1 text-xs text-slate-600">
          Your trustee uploads progress proof to IPFS as work advances.
        </p>
      </div>
    );
  }

  const active = activeIndex === null ? null : evidence[activeIndex];

  async function copyCid(cid: string) {
    try {
      await navigator.clipboard.writeText(cid);
      setCopiedCid(cid);
    } catch {
      // Clipboard access can be blocked; the CID stays selectable on screen.
      setCopiedCid(null);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {evidence.map((item, index) => (
          <EvidenceThumb
            key={item.id}
            evidence={item}
            onOpen={() => setActiveIndex(index)}
          />
        ))}
      </div>

      <Modal
        open={active !== null}
        onClose={close}
        labelledBy={titleId}
        size="xl"
      >
        {active && (
          <div>
            <div
              className="relative aspect-video w-full"
              style={tileStyle(active.hue)}
            >
              <span className="absolute inset-0" style={BLUEPRINT_OVERLAY} aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 to-transparent" aria-hidden="true" />

              <button
                type="button"
                onClick={close}
                className="absolute top-4 right-4 rounded-xl bg-black/50 p-2 text-slate-200 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                aria-label="Close photo viewer"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {evidence.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-slate-200 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    aria-label="Previous photo"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-slate-200 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    aria-label="Next photo"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-6 flex items-center gap-3">
                <Badge tone="sky">{milestoneTitle}</Badge>
                {evidence.length > 1 && (
                  <span className="text-xs font-semibold text-slate-300">
                    {(activeIndex ?? 0) + 1} of {evidence.length}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <h3 id={titleId} className="text-lg font-bold text-white">
                  {active.caption}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Captured {formatDate(active.capturedAt)} by {active.capturedBy}
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 uppercase">IPFS content ID</p>
                  <p className="truncate font-mono text-xs text-slate-300" title={active.ipfsCid}>
                    {truncateHash(active.ipfsCid, 18, 10)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyCid(active.ipfsCid)}
                  className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  {copiedCid === active.ipfsCid ? "Copied" : "Copy CID"}
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Proof is content-addressed — the CID above changes if the photo is
                altered, so the record anchored on-chain cannot be swapped after
                verification.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
