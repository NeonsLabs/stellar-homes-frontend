"use client";

import React, { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useApp } from "@/components/providers/AppProvider";
import Address from "@/components/ui/Address";
import { Badge, BadgeTone } from "@/components/ui/Badge";
import Panel, { Row } from "@/components/ui/Panel";
import { EmptyState, ErrorNotice, Loading } from "@/components/ui/States";
import { api, ContractEvent, ContractName } from "@/lib/api";
import { formatBps, formatDuration, formatLedgerDateTime, formatUsdc, truncateHash } from "@/lib/format";
import { useApi } from "@/lib/useApi";

const CONTRACTS: { value: ContractName; label: string; tone: BadgeTone }[] = [
  { value: "registry", label: "PropertyRegistry", tone: "sky" },
  { value: "lending", label: "LendingPool", tone: "emerald" },
  { value: "mortgage", label: "MortgagePool", tone: "amber" },
];

/** Event names as the contracts publish them, from docs/EVENTS.md. */
const EVENT_LABELS: Record<ContractName, Record<string, string>> = {
  registry: {
    submitted: "Property registered",
    trustee: "Trustee role changed",
    oracle: "Oracle role changed",
    title: "Title verified",
    valuation: "Valuation published",
    evidence: "Stage evidence submitted",
    verified: "Stage signed off",
    released: "Stage marked released",
    status: "Property status changed",
  },
  lending: {
    deposit: "Deposit",
    withdraw: "Withdrawal",
    interest: "Interest claimed",
    reserve: "Capital committed",
    unreserve: "Commitment released",
    disburse: "Tranche paid out",
    repay: "Repayment received",
    writeoff: "Principal written off",
  },
  mortgage: {
    applied: "Application",
    approved: "Approved",
    declined: "Declined",
    disbursd: "Tranche released",
    repaid: "Repayment",
    default: "Written off",
    undrwrtr: "Underwriter role changed",
  },
};

const AMOUNT_FIELDS = new Set([
  "amount",
  "principal",
  "interest",
  "tranche",
  "usdcValue",
  "totalCapital",
  "totalReserved",
  "totalLent",
  "totalWrittenOff",
  "writtenOff",
  "undrawn",
]);

function EventValue({ field, value }: { field: string; value: unknown }) {
  if (typeof value === "string" && /^[GC][A-Z2-7]{55}$/.test(value)) return <Address value={value} />;
  if (typeof value === "string" && /^[0-9a-f]{64}$/.test(value)) {
    return <span className="font-mono">{truncateHash(value, 8, 8)}</span>;
  }
  if (AMOUNT_FIELDS.has(field) && (typeof value === "string" || typeof value === "number")) {
    return <span className="font-mono">{formatUsdc(String(value))}</span>;
  }
  if (field === "stage" && typeof value === "number") return <>{value + 1} of 5</>;
  return <span className="font-mono">{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>;
}

function EventRow({ event }: { event: ContractEvent }) {
  const meta = CONTRACTS.find((c) => c.value === event.contract)!;
  return (
    <li className="space-y-2 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={meta.tone}>{meta.label}</Badge>
        <span className="font-semibold text-white">{EVENT_LABELS[event.contract][event.name] ?? event.name}</span>
        <span className="ml-auto text-xs text-slate-500">
          {formatLedgerDateTime(event.timestamp)} · ledger {event.ledger}
        </span>
      </div>
      <dl className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
        {Object.entries(event.data).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <dt>{k}</dt>
            <dd className="text-slate-200">
              <EventValue field={k} value={v} />
            </dd>
          </div>
        ))}
        {event.txHash && (
          <div className="flex items-center gap-1.5">
            <dt>tx</dt>
            <dd>
              <Address value={event.txHash} />
            </dd>
          </div>
        )}
      </dl>
    </li>
  );
}

export default function LedgerView() {
  const { stats, statsError } = useApp();
  const [contract, setContract] = useState<ContractName | "">("");
  const { data: health } = useApi("health", () => api.health());
  const { data, error } = useApi(`events:${contract}`, () => api.events({ contract: contract || undefined, limit: 1000 }));
  // Newest first; the backend returns them in ledger order.
  const events = data ? [...data.events].sort((a, b) => b.ledger - a.ledger).slice(0, 200) : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="On-chain layer" title="Ledger">
        Three Soroban contracts. The contract holding the money is never the contract deciding whose it is.
      </PageHeader>

      {statsError && !stats ? <ErrorNotice error={statsError} className="mb-6" /> : null}

      <div className="grid gap-6 lg:grid-cols-12 [&>*]:min-w-0">
        <div className="space-y-6 lg:col-span-5">
          <Panel title="Contracts">
            {stats ? (
              <dl>
                <Row label="PropertyRegistry">
                  <Address value={stats.contracts.propertyRegistry} />
                </Row>
                <Row label="LendingPool">
                  <Address value={stats.contracts.lendingPool} />
                </Row>
                <Row label="MortgagePool">
                  <Address value={stats.contracts.mortgagePool} />
                </Row>
                <Row label="Admin">
                  <Address value={stats.admin} />
                </Row>
              </dl>
            ) : (
              <Loading />
            )}
          </Panel>

          <Panel title="Rules" description="Read from the MortgagePool, where they are fixed in code.">
            {stats ? (
              <dl>
                <Row label="Maximum loan-to-value">{formatBps(stats.rules.maxLtvBps)}</Row>
                <Row label="Maximum annual rate">{formatBps(stats.rules.maxRateBps)}</Row>
                <Row label="Construction stages">{stats.rules.milestones}</Row>
                <Row label="Billing month">{formatDuration(stats.rules.secondsPerMonth)}</Row>
                <Row label="Grace period">{formatDuration(stats.rules.graceSecs)}</Row>
                <Row label="Ledger time">{formatLedgerDateTime(stats.ledgerTime)}</Row>
              </dl>
            ) : (
              <Loading />
            )}
          </Panel>

          <Panel title="Backend">
            {health ? (
              <dl>
                <Row label="Status">
                  <Badge tone={health.status === "healthy" ? "emerald" : "rose"} dot>
                    {health.status}
                  </Badge>
                </Row>
                <Row label="Network">{health.network}</Row>
                <Row label="Ledger">{health.ledger}</Row>
                <Row label="Version">{health.version}</Row>
                <Row label="Uptime">{formatDuration(Math.floor(health.uptime))}</Row>
              </dl>
            ) : (
              <Loading />
            )}
          </Panel>
        </div>

        <div className="lg:col-span-7">
          <Panel
            title="Contract events"
            description={
              stats?.ledger === "soroban"
                ? "From Soroban RPC, which keeps only recent ledgers."
                : "Everything the simulated contracts have published."
            }
          >
            <div className="mb-2 flex flex-wrap gap-2" role="group" aria-label="Filter by contract">
              {[{ value: "" as const, label: "All", tone: "slate" as BadgeTone }, ...CONTRACTS].map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={contract === c.value}
                  onClick={() => setContract(c.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    contract === c.value
                      ? "border-sky-500/50 bg-sky-500/15 text-sky-200"
                      : "border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {error ? (
              <ErrorNotice error={error} />
            ) : !data ? (
              <Loading />
            ) : events.length === 0 ? (
              <EmptyState title="No events yet" />
            ) : (
              <ul className="divide-y divide-white/5">
                {events.map((e, i) => (
                  <EventRow key={`${e.ledger}-${e.contract}-${e.name}-${i}`} event={e} />
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}
