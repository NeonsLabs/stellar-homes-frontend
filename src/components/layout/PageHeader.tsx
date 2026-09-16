import React from "react";

export default function PageHeader({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl space-y-2">
        <p className="text-xs font-bold tracking-wider text-sky-400 uppercase">{eyebrow}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">{title}</h1>
        {children && <div className="leading-relaxed text-slate-400">{children}</div>}
      </div>
      {action}
    </div>
  );
}
