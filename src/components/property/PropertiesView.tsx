"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import Address from "@/components/ui/Address";
import { PropertyStatusBadge } from "@/components/ui/Badge";
import { EmptyState, ErrorNotice, Loading } from "@/components/ui/States";
import { api, PropertyStatus } from "@/lib/api";
import { maxPrincipal } from "@/lib/amortization";
import { formatUsdc, toBig, truncateHash } from "@/lib/format";
import { useApi } from "@/lib/useApi";

const FILTERS: { value: PropertyStatus | "all" | "lendable"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "lendable", label: "Open for a mortgage" },
  { value: "Pending", label: "Title pending" },
  { value: "Mortgaged", label: "Mortgaged" },
  { value: "Repaid", label: "Repaid" },
  { value: "Defaulted", label: "Defaulted" },
];

const PAGE = 100;

export default function PropertiesView() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("all");
  const [offset, setOffset] = useState(0);
  const { data, error, loading } = useApi(`properties:${offset}`, () => api.properties(offset, PAGE));

  // A property is lendable once its title is verified and it has a valuation.
  // Whether it already has a live application is on the detail page.
  const properties = (data?.properties ?? []).filter((p) => {
    if (filter === "all") return true;
    if (filter === "lendable") return p.status === "Verified" && toBig(p.usdcValue) > 0n;
    return p.status === filter;
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="PropertyRegistry"
        title="Properties"
        action={
          <Link href="/trustee" className="glass-btn-secondary">
            Register a property
          </Link>
        }
      >
        Every plot a trustee has registered on-chain. Titles and surveys are stored as digests only; the documents stay
        with the parties who need them.
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === f.value
                ? "border-sky-500/50 bg-sky-500/15 text-sky-200"
                : "border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorNotice error={error} />
      ) : !data && loading ? (
        <Loading />
      ) : properties.length === 0 ? (
        <EmptyState
          title={data?.total ? "No properties match this filter" : "No properties registered yet"}
          action={
            !data?.total && (
              <Link href="/trustee" className="glass-btn-primary">
                Register the first property
              </Link>
            )
          }
        >
          {!data?.total && "A registered trustee submits a property with the digests of its title deed and survey."}
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => {
            const value = toBig(p.usdcValue);
            return (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                className="glass-panel hover-glow flex flex-col gap-4 rounded-3xl p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Property</p>
                    <p className="text-2xl font-extrabold text-white">#{p.id}</p>
                  </div>
                  <PropertyStatusBadge status={p.status} />
                </div>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">Valuation</dt>
                    <dd className="font-semibold text-white">{value > 0n ? formatUsdc(value, { whole: true }) : "Not valued"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">Max loan (80%)</dt>
                    <dd className="font-semibold text-emerald-300">
                      {value > 0n ? formatUsdc(maxPrincipal(value), { whole: true }) : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">Title digest</dt>
                    <dd className="font-mono text-xs text-slate-300">{truncateHash(p.titleHash)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-400">Trustee</dt>
                    <dd className="min-w-0" onClick={(e) => e.preventDefault()}>
                      <Address value={p.trustee} />
                    </dd>
                  </div>
                </dl>
              </Link>
            );
          })}
        </div>
      )}

      {data && data.total > PAGE && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-400">
          <button
            type="button"
            className="glass-btn-secondary"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE))}
          >
            Previous
          </button>
          <span>
            {offset + 1}–{Math.min(offset + PAGE, data.total)} of {data.total}
          </span>
          <button
            type="button"
            className="glass-btn-secondary"
            disabled={offset + PAGE >= data.total}
            onClick={() => setOffset(offset + PAGE)}
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
