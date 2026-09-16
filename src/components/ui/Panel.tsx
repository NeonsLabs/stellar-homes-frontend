import React from "react";

export interface PanelProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Trailing slot in the header row, e.g. a badge or action. */
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}

/** The glass card every section sits in. */
export default function Panel({ title, description, action, children, className = "", id }: PanelProps) {
  return (
    <section id={id} className={`glass-panel scroll-mt-24 rounded-3xl p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {title && <h2 className="text-lg font-bold text-white">{title}</h2>}
            {description && <p className="text-sm leading-relaxed text-slate-400">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** A label / value row inside a panel. */
export function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-white/5 py-2.5 text-sm last:border-0">
      <dt className="text-slate-400">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-slate-100">{children}</dd>
    </div>
  );
}
