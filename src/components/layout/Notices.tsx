"use client";

import React from "react";
import { useApp } from "@/components/providers/AppProvider";

const TONES = {
  success: "border-emerald-500/30 bg-[#0f2a24]",
  error: "border-rose-500/30 bg-[#2a1219]",
  info: "border-sky-500/30 bg-[#0f2033]",
};

const DOT = {
  success: "bg-emerald-400",
  error: "bg-rose-400",
  info: "bg-sky-400 animate-pulse",
};

/** Transaction and error notices, stacked bottom-right. */
export default function Notices() {
  const { notices, dismiss } = useApp();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-0 bottom-0 z-[120] flex w-full flex-col items-end gap-2 p-4 sm:max-w-sm"
    >
      {notices.map((n) => (
        <div
          key={n.id}
          role={n.tone === "error" ? "alert" : "status"}
          className={`animate-slide-up pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-4 shadow-2xl shadow-black/40 ${TONES[n.tone]}`}
        >
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[n.tone]}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">{n.title}</p>
            {n.detail && <p className="mt-0.5 text-xs break-words text-slate-400">{n.detail}</p>}
          </div>
          <button
            type="button"
            onClick={() => dismiss(n.id)}
            aria-label="Dismiss"
            className="text-slate-500 hover:text-white"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
