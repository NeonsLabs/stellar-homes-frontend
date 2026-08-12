"use client";

import React, { useRef, useState } from "react";
import { ACCEPT_ATTRIBUTE, MAX_FILE_BYTES, formatBytes } from "@/lib/kycUpload";
import type { DocumentSlotSpec, UploadedDocument } from "@/types/kyc";

function UploadIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M7 16a4 4 0 01-.88-7.9A5 5 0 1115.9 6 4.5 4.5 0 1117 15h-1m-5-4v9m0-9l-3 3m3-3l3 3"
      />
    </svg>
  );
}

export interface DocumentUploaderProps {
  slot: DocumentSlotSpec;
  value: UploadedDocument | undefined;
  error?: string;
  onSelect: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
}

/**
 * One document upload slot: drop zone, preview and replace/remove controls.
 *
 * The drop zone is a `<label>` bound to a visually hidden file input, so
 * clicking, tapping and keyboard activation all work through native browser
 * behaviour rather than synthetic click forwarding.
 */
export default function DocumentUploader({
  slot,
  value,
  error,
  onSelect,
  onRemove,
  disabled = false,
}: DocumentUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputId = `kyc-upload-${slot.id}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const descriptionId = `${inputId}-description`;

  function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0];
    if (file) onSelect(file);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    handleFiles(event.dataTransfer.files);
  }

  function handleRemove() {
    onRemove();
    // Clear the input so re-picking the same file still fires a change event.
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-slate-200">
          {slot.label}
          {slot.required ? (
            <span className="ml-1 text-rose-400" aria-hidden="true">
              *
            </span>
          ) : (
            <span className="ml-2 text-xs font-normal text-slate-500">Optional</span>
          )}
        </p>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        disabled={disabled}
        className="peer sr-only"
        aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ")}
        aria-invalid={Boolean(error)}
        onChange={(event) => handleFiles(event.target.files)}
      />

      {value ? (
        <div
          className={`flex items-center gap-4 rounded-2xl border p-3 ${
            error ? "border-rose-500/40 bg-rose-500/[0.06]" : "border-white/10 bg-white/[0.03]"
          }`}
        >
          {/* Object-URL previews cannot go through the Next image optimiser,
              so this stays a plain img. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.previewUrl}
            alt={`Preview of the ${slot.label.toLowerCase()} you uploaded`}
            className="h-20 w-20 shrink-0 rounded-xl border border-white/10 object-cover"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white" title={value.file.name}>
              {value.file.name}
            </p>
            <p className="text-xs text-slate-500">{formatBytes(value.file.size)}</p>
            <div className="mt-2 flex gap-2">
              <label
                htmlFor={inputId}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10"
              >
                Replace
              </label>
              <button
                type="button"
                onClick={handleRemove}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-sky-400 ${
            disabled
              ? "cursor-not-allowed border-white/5 bg-white/[0.01] opacity-50"
              : dragging
                ? "border-sky-400 bg-sky-500/10"
                : error
                  ? "border-rose-500/40 bg-rose-500/[0.06] hover:border-rose-500/60"
                  : "border-white/15 bg-white/[0.02] hover:border-sky-500/40 hover:bg-white/[0.04]"
          }`}
        >
          <span className={dragging ? "text-sky-300" : "text-slate-500"}>
            <UploadIcon />
          </span>
          <span className="text-sm font-semibold text-slate-300">
            {dragging ? "Drop the image here" : "Drag an image here, or browse"}
          </span>
          <span className="text-xs text-slate-500">
            JPG, PNG or WebP · up to {formatBytes(MAX_FILE_BYTES)}
          </span>
        </label>
      )}

      <p id={descriptionId} className="text-xs text-slate-500">
        {slot.description}
      </p>

      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-xs text-rose-400">
          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
