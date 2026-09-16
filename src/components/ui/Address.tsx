"use client";

import React, { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { truncateHash } from "@/lib/format";

/**
 * A Stellar address or digest, shortened, with a copy button. Marks the
 * connected account and any account this browser knows by label.
 */
export default function Address({
  value,
  full = false,
  className = "",
}: {
  value: string | null | undefined;
  full?: boolean;
  className?: string;
}) {
  const { accounts, account } = useApp();
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-slate-500">—</span>;

  const known = accounts.find((a) => a.address === value);
  const isYou = account?.address === value;

  async function copy() {
    try {
      await navigator.clipboard.writeText(value!);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be refused; the value is still selectable.
    }
  }

  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 align-middle ${className}`}>
      <span className={`font-mono text-[0.8125rem] text-slate-200 ${full ? "break-all" : "truncate"}`} title={value}>
        {full ? value : truncateHash(value)}
      </span>
      {known && (
        <span
          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${isYou ? "bg-sky-500/15 text-sky-300" : "bg-white/5 text-slate-400"}`}
        >
          {isYou ? "you" : known.label}
        </span>
      )}
      <button
        type="button"
        onClick={copy}
        aria-label="Copy to clipboard"
        className="shrink-0 rounded p-0.5 text-slate-500 hover:text-slate-200"
      >
        {copied ? (
          <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    </span>
  );
}
