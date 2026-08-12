"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import Modal from "@/components/dashboard/Modal";
import IpfsImage from "./IpfsImage";
import {
  DEFAULT_GATEWAY_ID,
  IPFS_GATEWAYS,
  buildGatewayUrl,
  cidInspectorUrl,
  parseIpfsUri,
  shortenCid,
  supportsSubdomainGateway,
} from "@/lib/ipfs";
import type { IpfsMediaItem, IpfsMediaStatus } from "@/types/ipfs";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

function Icon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
    </svg>
  );
}

const ICONS = {
  close: "M6 18L18 6M6 6l12 12",
  prev: "M15 19l-7-7 7-7",
  next: "M9 5l7 7-7 7",
  zoomIn: "M21 21l-4.35-4.35M11 8v6M8 11h6M19 11a8 8 0 11-16 0 8 8 0 0116 0z",
  zoomOut: "M21 21l-4.35-4.35M8 11h6M19 11a8 8 0 11-16 0 8 8 0 0116 0z",
  reset: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
};

function ToolbarButton({
  label,
  icon,
  onClick,
  disabled = false,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="rounded-lg bg-black/50 p-2 text-slate-200 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon path={icon} className="h-4 w-4" />
    </button>
  );
}

export interface IpfsMediaViewerProps {
  open: boolean;
  items: IpfsMediaItem[];
  /** Index of the item on screen; the parent owns it so deep links can work. */
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Short context chip, e.g. "Milestone 3". */
  contextLabel?: string;
}

/**
 * Full-screen viewer for a set of files stored on IPFS.
 *
 * Beyond showing the image, this is a verification tool: it exposes the CID,
 * which gateway actually served the bytes, a way to force a different gateway
 * when one is slow or censoring, and links to fetch the raw object or inspect
 * the CID independently. That matters because a milestone photo is evidence
 * for releasing escrow — a viewer that silently proxies content would give a
 * borrower no way to check that what they see matches what was signed.
 */
export default function IpfsMediaViewer({
  open,
  items,
  index,
  onIndexChange,
  onClose,
  contextLabel,
}: IpfsMediaViewerProps) {
  const titleId = useId();
  const [gatewayId, setGatewayId] = useState(DEFAULT_GATEWAY_ID);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState<IpfsMediaStatus>("loading");
  const [servedBy, setServedBy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  /** Pointer origin for the current drag; only ever touched in handlers. */
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  // Mirrored in state because the render needs it to suppress the transition.
  const [dragging, setDragging] = useState(false);

  const safeIndex = Math.min(Math.max(index, 0), Math.max(0, items.length - 1));
  const item = items[safeIndex];
  const parsed = item ? parseIpfsUri(item.uri) : null;

  const resetView = useCallback(() => {
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  }, []);

  const step = useCallback(
    (delta: number) => {
      if (items.length === 0) return;
      onIndexChange((safeIndex + delta + items.length) % items.length);
      resetView();
      setCopied(false);
    },
    [items.length, onIndexChange, resetView, safeIndex],
  );

  const zoomBy = useCallback((delta: number) => {
    // Purely functional so rapid clicks accumulate instead of both reading the
    // same rendered value. Recentring at 1x is handled at render time below.
    setZoom((current) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current + delta)));
  }, []);

  // Keyboard shortcuts. Escape is handled by the dialog itself.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case "ArrowRight":
          step(1);
          break;
        case "ArrowLeft":
          step(-1);
          break;
        case "+":
        case "=":
          zoomBy(ZOOM_STEP);
          break;
        case "-":
          zoomBy(-ZOOM_STEP);
          break;
        case "0":
          resetView();
          break;
        default:
          return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, resetView, step, zoomBy]);

  if (!open || !item) return null;

  /** Clamps panning so the image cannot be dragged off the stage. */
  function clampOffset(x: number, y: number, scale: number) {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return { x, y };
    const maxX = (rect.width * (scale - 1)) / 2;
    const maxY = (rect.height * (scale - 1)) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }

  function onPointerDown(event: React.PointerEvent) {
    if (zoom === MIN_ZOOM || event.button !== 0) return;

    // The zoom and navigation controls sit on top of the stage. Without this
    // guard the stage would capture the pointer on the way down and swallow
    // their click, leaving every control dead once the image was zoomed.
    if ((event.target as HTMLElement).closest("button, a, select, input, label")) {
      return;
    }

    drag.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!drag.current) return;
    const next = clampOffset(
      drag.current.ox + (event.clientX - drag.current.x),
      drag.current.oy + (event.clientY - drag.current.y),
      zoom,
    );
    setOffset(next);
  }

  function onPointerUp(event: React.PointerEvent) {
    drag.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function selectGateway(id: string) {
    setGatewayId(id);
    setStatus("loading");
    setServedBy(null);
  }

  async function copyUri() {
    try {
      await navigator.clipboard.writeText(parsed?.uri ?? item.uri);
      setCopied(true);
    } catch {
      // Clipboard access can be blocked; the reference stays selectable.
      setCopied(false);
    }
  }

  const rawUrl = parsed
    ? buildGatewayUrl(parsed, IPFS_GATEWAYS.find((g) => g.id === gatewayId) ?? IPFS_GATEWAYS[0])
    : null;

  // Panning is meaningless at 1x, so a stale offset is ignored rather than
  // cleared — keeping the zoom updater pure.
  const appliedOffset = zoom === MIN_ZOOM ? { x: 0, y: 0 } : offset;

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} size="2xl">
      <div className="flex flex-col">
        {/* --- Stage ------------------------------------------------------ */}
        <div
          ref={stageRef}
          className="relative aspect-[16/10] w-full overflow-hidden bg-black/60 select-none"
          style={{
            ...item.placeholderStyle,
            // Claim touch gestures only while zoomed, so the page still scrolls
            // normally when the image is at its natural size.
            touchAction: zoom === MIN_ZOOM ? undefined : "none",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={() => (zoom === MIN_ZOOM ? zoomBy(ZOOM_STEP * 2) : resetView())}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${appliedOffset.x}px, ${appliedOffset.y}px) scale(${zoom})`,
              transition: dragging ? "none" : "transform 180ms ease-out",
              cursor: zoom === MIN_ZOOM ? "zoom-in" : dragging ? "grabbing" : "grab",
            }}
          >
            <IpfsImage
              // Remount on both item and gateway change so retry state resets.
              key={`${item.id}-${gatewayId}`}
              uri={item.uri}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-contain"
              placeholderStyle={item.placeholderStyle}
              preferredGatewayId={gatewayId}
              loading="eager"
              onStatusChange={(next, url) => {
                setStatus(next);
                setServedBy(next === "loaded" && url ? new URL(url).hostname : null);
              }}
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close media viewer"
            className="absolute top-4 right-4 rounded-xl bg-black/50 p-2 text-slate-200 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <Icon path={ICONS.close} />
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous file"
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-slate-200 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <Icon path={ICONS.prev} />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next file"
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-slate-200 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <Icon path={ICONS.next} />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            {contextLabel && (
              <span className="rounded-full border border-sky-500/30 bg-sky-500/15 px-2.5 py-1 text-xs font-semibold text-sky-300 backdrop-blur-sm">
                {contextLabel}
              </span>
            )}
            {items.length > 1 && (
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-slate-300 backdrop-blur-sm">
                {safeIndex + 1} of {items.length}
              </span>
            )}
          </div>

          <div className="absolute right-4 bottom-4 flex items-center gap-2">
            <span className="rounded-lg bg-black/50 px-2 py-1 text-[11px] font-semibold text-slate-300 backdrop-blur-sm tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <ToolbarButton
              label="Zoom out"
              icon={ICONS.zoomOut}
              onClick={() => zoomBy(-ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
            />
            <ToolbarButton
              label="Zoom in"
              icon={ICONS.zoomIn}
              onClick={() => zoomBy(ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
            />
            <ToolbarButton
              label="Reset view"
              icon={ICONS.reset}
              onClick={resetView}
              disabled={zoom === MIN_ZOOM}
            />
          </div>
        </div>

        {/* --- Filmstrip -------------------------------------------------- */}
        {items.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b border-white/5 bg-black/20 p-3">
            {items.map((entry, entryIndex) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  onIndexChange(entryIndex);
                  resetView();
                }}
                aria-label={`View ${entry.title}`}
                aria-current={entryIndex === safeIndex}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  entryIndex === safeIndex
                    ? "border-sky-400 opacity-100"
                    : "border-white/10 opacity-60 hover:opacity-90"
                }`}
                style={entry.placeholderStyle}
              >
                <IpfsImage
                  uri={entry.uri}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  placeholderStyle={entry.placeholderStyle}
                  compact
                />
              </button>
            ))}
          </div>
        )}

        {/* --- Details ---------------------------------------------------- */}
        <div className="space-y-5 p-6">
          <div>
            <h3 id={titleId} className="text-lg font-bold text-white">
              {item.title}
            </h3>
            {item.subtitle && <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p>}
          </div>

          {item.meta && item.meta.length > 0 && (
            <dl className="grid gap-3 sm:grid-cols-2">
              {item.meta.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs text-slate-500">{row.label}</dt>
                  <dd
                    className={`text-sm font-semibold break-all text-slate-200 ${row.mono ? "font-mono text-xs" : ""}`}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-slate-500 uppercase">Content identifier</p>
                <p className="truncate font-mono text-xs text-slate-300" title={parsed?.uri ?? item.uri}>
                  {parsed ? shortenCid(parsed.root, 16, 10) : item.uri}
                  {parsed?.path ? `/${parsed.path}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={copyUri}
                className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                {copied ? "Copied" : "Copy ipfs:// URI"}
              </button>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/5 pt-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <label
                  htmlFor={`${titleId}-gateway`}
                  className="block text-xs text-slate-500 uppercase"
                >
                  Gateway
                </label>
                <select
                  id={`${titleId}-gateway`}
                  value={gatewayId}
                  onChange={(event) => selectGateway(event.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  {IPFS_GATEWAYS.map((gateway) => {
                    // A CIDv0 cannot live in a subdomain — see lib/ipfs.
                    const usable =
                      gateway.style === "path" ||
                      (parsed ? supportsSubdomainGateway(parsed.root) : false);
                    return (
                      <option
                        key={gateway.id}
                        value={gateway.id}
                        disabled={!usable}
                        className="bg-[#161f30]"
                      >
                        {gateway.label} — {gateway.operator}
                        {usable ? "" : " (needs CIDv1)"}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-slate-500">
                  {status === "loaded" && servedBy
                    ? `Served by ${servedBy}`
                    : status === "error"
                      ? "No gateway could serve this file"
                      : "Fetching…"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {rawUrl && (
                  <a
                    href={rawUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-sky-400 transition-colors hover:bg-white/10"
                  >
                    Open original ↗
                  </a>
                )}
                {parsed && (
                  <a
                    href={cidInspectorUrl(parsed.root)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10"
                  >
                    Inspect CID ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-500">
            Content is addressed by hash, so the identifier above changes if the
            file is altered. Any gateway returns the same bytes for the same CID —
            switch gateways to verify independently.
          </p>
        </div>
      </div>
    </Modal>
  );
}
