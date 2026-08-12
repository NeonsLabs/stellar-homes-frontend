"use client";

import React, { useMemo, useState } from "react";
import IpfsImage from "@/components/ipfs/IpfsImage";
import IpfsMediaViewer from "@/components/ipfs/IpfsMediaViewer";
import { formatDate } from "@/lib/format";
import type { MilestoneEvidence } from "@/types/dashboard";
import type { IpfsMediaItem } from "@/types/ipfs";

/**
 * Deterministic tint for an evidence tile.
 *
 * The photo itself is fetched from IPFS; this gradient is the backdrop it
 * loads over, derived from the record's stable `hue` so the same proof always
 * renders the same way on the server and the client.
 */
function tileStyle(hue: number): React.CSSProperties {
  return {
    backgroundImage: `linear-gradient(135deg, hsl(${hue} 52% 28%) 0%, hsl(${(hue + 34) % 360} 46% 15%) 60%, hsl(${(hue + 60) % 360} 40% 11%) 100%)`,
  };
}

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
      <IpfsImage
        uri={evidence.ipfsCid}
        alt={evidence.caption}
        className="absolute inset-0 h-full w-full object-cover"
        placeholderStyle={tileStyle(evidence.hue)}
        compact
      />

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
 * Grid of construction proof photos, opening into the shared IPFS viewer.
 *
 * This component owns the milestone vocabulary; everything about fetching,
 * gateway failover and CID verification lives in the viewer, so title deeds
 * and inspection reports can reuse it unchanged.
 */
export default function EvidenceGallery({
  evidence,
  milestoneTitle,
}: EvidenceGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const items = useMemo<IpfsMediaItem[]>(
    () =>
      evidence.map((entry) => ({
        id: entry.id,
        uri: entry.ipfsCid,
        title: entry.caption,
        subtitle: `Captured ${formatDate(entry.capturedAt)} by ${entry.capturedBy}`,
        meta: [
          { label: "Captured on", value: formatDate(entry.capturedAt) },
          { label: "Submitted by", value: entry.capturedBy },
        ],
        placeholderStyle: tileStyle(entry.hue),
      })),
    [evidence],
  );

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

      <IpfsMediaViewer
        open={activeIndex !== null}
        items={items}
        index={activeIndex ?? 0}
        onIndexChange={setActiveIndex}
        onClose={() => setActiveIndex(null)}
        contextLabel={milestoneTitle}
      />
    </>
  );
}
