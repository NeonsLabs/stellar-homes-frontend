"use client";

import React, { useId, useState } from "react";
import { normalizeHash, sha256File } from "@/lib/hash";
import { truncateHash } from "@/lib/format";

/**
 * Pick a document to fingerprint, or paste a digest. The file is hashed with
 * SHA-256 in the browser and never leaves the device; only the digest is sent.
 */
export default function HashInput({
  label,
  hint,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (hash: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const [fileName, setFileName] = useState<string | null>(null);
  const [hashing, setHashing] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [draft, setDraft] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setHashing(true);
    try {
      onChange(await sha256File(file));
      setFileName(file.name);
    } finally {
      setHashing(false);
    }
  }

  const draftValid = draft === "" || normalizeHash(draft) !== null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="block text-xs font-bold tracking-wide text-slate-400 uppercase">{label}</span>
        <button
          type="button"
          onClick={() => setPasting((p) => !p)}
          className="text-[11px] font-semibold text-sky-400 hover:text-sky-300"
        >
          {pasting ? "Choose a file instead" : "Paste a digest instead"}
        </button>
      </div>

      {pasting ? (
        <>
          <input
            className="glass-input font-mono"
            placeholder="64 hex characters"
            value={draft}
            disabled={disabled}
            onChange={(e) => {
              setDraft(e.target.value);
              const hash = normalizeHash(e.target.value);
              onChange(hash ?? "");
              setFileName(null);
            }}
          />
          {!draftValid && <p className="text-xs text-rose-300">A digest is 64 hexadecimal characters.</p>}
        </>
      ) : (
        <label
          htmlFor={id}
          className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-sm transition-colors ${
            value ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/15 hover:border-sky-500/50"
          } ${disabled ? "pointer-events-none opacity-50" : ""}`}
        >
          <input
            id={id}
            type="file"
            className="sr-only"
            disabled={disabled}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="min-w-0 flex-1">
            {hashing ? (
              <span className="text-slate-300">Hashing…</span>
            ) : value ? (
              <>
                <span className="block truncate font-semibold text-emerald-300">{fileName ?? "Digest set"}</span>
                <span className="block font-mono text-xs text-slate-400">sha256 {truncateHash(value, 10, 10)}</span>
              </>
            ) : (
              <span className="text-slate-400">Choose a file to fingerprint</span>
            )}
          </span>
        </label>
      )}
      {hint && <p className="text-xs leading-relaxed text-slate-500">{hint}</p>}
    </div>
  );
}
