import React from "react";
import { describeError } from "@/lib/errors";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-500/30 border-t-sky-400 ${className}`}
    />
  );
}

export function Loading({ label = "Loading from the ledger…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-400">
      <Spinner />
      {label}
    </div>
  );
}

export function ErrorNotice({ error, className = "" }: { error: unknown; className?: string }) {
  const { title, detail } = describeError(error);
  return (
    <div role="alert" className={`rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm ${className}`}>
      <p className="font-semibold text-rose-200">{title}</p>
      {detail && <p className="mt-1 text-xs break-words text-rose-300/80">{detail}</p>}
    </div>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
  className = "",
}: {
  tone?: "info" | "warning" | "success";
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-sky-500/25 bg-sky-500/5 text-sky-100",
    warning: "border-amber-500/30 bg-amber-500/5 text-amber-100",
    success: "border-emerald-500/30 bg-emerald-500/5 text-emerald-100",
  };
  return (
    <div className={`rounded-2xl border p-4 text-sm leading-relaxed ${tones[tone]} ${className}`}>
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={`${title ? "mt-1" : ""} text-slate-300`}>{children}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">
      <p className="font-semibold text-slate-200">{title}</p>
      {children && <div className="max-w-md text-sm leading-relaxed text-slate-400">{children}</div>}
      {action}
    </div>
  );
}
