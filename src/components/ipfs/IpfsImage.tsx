"use client";

import React, { useMemo, useState } from "react";
import { getGatewayCandidates } from "@/lib/ipfs";
import type { IpfsMediaStatus } from "@/types/ipfs";

export interface IpfsImageProps {
  /** Any reference `parseIpfsUri` understands: `ipfs://…`, a CID, or a path. */
  uri: string;
  alt: string;
  /** Classes for the `<img>` itself. */
  className?: string;
  /** Backdrop shown while loading and behind a transparent image. */
  placeholderStyle?: React.CSSProperties;
  /** Gateway to try first; the rest stay as fallbacks. */
  preferredGatewayId?: string;
  loading?: "lazy" | "eager";
  /** Shrinks the failure state for thumbnail-sized tiles. */
  compact?: boolean;
  /** Reports each transition, so a parent can show its own chrome. */
  onStatusChange?: (status: IpfsMediaStatus, url: string | null) => void;
}

function WarningIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  );
}

/**
 * Renders an image stored on IPFS, walking the gateway list until one serves.
 *
 * Public gateways rate-limit, time out and occasionally disappear, so a single
 * hard-coded URL makes evidence look missing when it is merely unreachable.
 * Each `onError` advances to the next candidate; only once every gateway has
 * refused does this report a failure, and even then it offers a retry and the
 * raw URL so the content can be checked independently.
 *
 * A plain `<img>` is deliberate: gateway content is arbitrary user-pinned
 * media of unknown size, so routing it through the Next image optimiser would
 * proxy untrusted bytes through the server, and swapping `src` across hosts on
 * error is exactly what the optimiser's caching gets in the way of.
 *
 * Pass `key={uri}` when the same slot shows different content over time, so
 * the retry state starts fresh.
 */
export default function IpfsImage({
  uri,
  alt,
  className = "",
  placeholderStyle,
  preferredGatewayId,
  loading = "lazy",
  compact = false,
  onStatusChange,
}: IpfsImageProps) {
  const candidates = useMemo(
    () => getGatewayCandidates(uri, preferredGatewayId),
    [uri, preferredGatewayId],
  );

  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<IpfsMediaStatus>("loading");
  /** Bumped by Retry to remount the `<img>` and force a fresh request. */
  const [attempt, setAttempt] = useState(0);

  // Clamped so a shorter candidate list (a changed `uri`) cannot overrun.
  const safeIndex = Math.min(index, Math.max(0, candidates.length - 1));
  const src = candidates[safeIndex] ?? null;

  function report(next: IpfsMediaStatus, url: string | null) {
    setStatus(next);
    onStatusChange?.(next, url);
  }

  function handleError() {
    if (safeIndex < candidates.length - 1) {
      // Try the next gateway; still loading from the caller's point of view.
      setIndex(safeIndex + 1);
      return;
    }
    report("error", src);
  }

  /**
   * Recovers a `load`/`error` that fired before React attached its handlers.
   *
   * The `<img>` is server-rendered, so the browser begins fetching during
   * hydration. A cached hit or an instant failure therefore completes before
   * `onLoad`/`onError` exist, and without this the tile would sit on its
   * placeholder forever — invisible on a second visit, and never failing over
   * to the next gateway. Checking `complete` when the element mounts closes
   * that window.
   */
  function reconcileMissedEvent(node: HTMLImageElement | null) {
    if (!node || !node.src || !node.complete) return;

    if (node.naturalWidth > 0) {
      if (status !== "loaded") report("loaded", src);
    } else if (status !== "error") {
      handleError();
    }
  }

  function retry() {
    setIndex(0);
    setAttempt((value) => value + 1);
    report("loading", candidates[0] ?? null);
  }

  const unresolvable = candidates.length === 0;
  const failed = unresolvable || status === "error";

  if (failed) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-900/60 p-3 text-center ${className}`}
        style={placeholderStyle}
        role="img"
        aria-label={`${alt} — could not be loaded from IPFS`}
      >
        <span className="text-amber-400">
          <WarningIcon className={compact ? "h-5 w-5" : "h-7 w-7"} />
        </span>
        <p className={`font-semibold text-slate-300 ${compact ? "text-[10px]" : "text-sm"}`}>
          {unresolvable ? "Not a valid IPFS reference" : "Unavailable on IPFS gateways"}
        </p>

        {!compact && !unresolvable && (
          <p className="max-w-xs text-xs leading-relaxed text-slate-500">
            All {candidates.length} gateways refused this request. The content may
            no longer be pinned, or the gateways may be rate-limiting.
          </p>
        )}

        {!unresolvable && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={retry}
              className={`rounded-lg border border-white/10 bg-white/5 font-semibold text-slate-200 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
              }`}
            >
              Retry
            </button>
            {!compact && src && (
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-sky-400 transition-colors hover:bg-white/10"
              >
                Open raw URL ↗
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {status === "loading" && (
        <span
          className="absolute inset-0 animate-pulse bg-slate-800/40"
          style={placeholderStyle}
          aria-hidden="true"
        />
      )}
      {/* Gateway media is arbitrary remote content — see the note above on why
          this is not a next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={`${safeIndex}-${attempt}`}
        ref={reconcileMissedEvent}
        src={src ?? ""}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => report("loaded", src)}
        onError={handleError}
        className={`${className} ${status === "loaded" ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
      />
    </>
  );
}
