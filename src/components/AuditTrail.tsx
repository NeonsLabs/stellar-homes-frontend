"use client";

import React from "react";
import { api, AuditEvent, EntityKind } from "@/lib/api";
import { formatIsoDateTime } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import Address from "./ui/Address";
import { Badge, BadgeTone } from "./ui/Badge";
import { EmptyState, ErrorNotice, Loading } from "./ui/States";

const TYPE_TONES: Record<AuditEvent["type"], BadgeTone> = {
  KYC: "violet",
  REGISTRY: "sky",
  LENDING: "emerald",
  MORTGAGE: "amber",
  TX: "slate",
  SYSTEM: "slate",
};

export function AuditList({ events }: { events: AuditEvent[] }) {
  if (events.length === 0) {
    return <EmptyState title="No activity yet" />;
  }
  return (
    <ul className="divide-y divide-white/5">
      {events.map((e) => (
        <li key={e.id} className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex shrink-0 items-center gap-2 sm:w-56">
            <Badge tone={TYPE_TONES[e.type]}>{e.type}</Badge>
            <span className="font-mono text-[11px] text-slate-400">{e.action}</span>
          </div>
          <div className="min-w-0 flex-1 space-y-1 text-sm">
            <p className="break-words text-slate-200">{e.details}</p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span>{formatIsoDateTime(e.timestamp)}</span>
              {e.actor && (
                <span className="flex items-center gap-1">
                  by <Address value={e.actor} />
                </span>
              )}
              {e.entityKind && e.entityKind !== "investor" && (
                <span>
                  {e.entityKind} #{e.entityId}
                </span>
              )}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Backend activity log for one property, mortgage or investor. */
export default function AuditTrail({ kind, id }: { kind: EntityKind; id: string }) {
  const { data, error, loading } = useApi(`audit:${kind}:${id}`, () => api.auditFor(kind, id));
  if (error) return <ErrorNotice error={error} />;
  if (!data && loading) return <Loading label="Loading activity…" />;
  return <AuditList events={data?.events ?? []} />;
}
