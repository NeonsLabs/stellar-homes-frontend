"use client";

import React, { useState } from "react";
import { AuditList } from "@/components/AuditTrail";
import PageHeader from "@/components/layout/PageHeader";
import { useApp } from "@/components/providers/AppProvider";
import Address from "@/components/ui/Address";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Field, { Select, TextInput } from "@/components/ui/Field";
import Panel, { Row } from "@/components/ui/Panel";
import { Callout, ErrorNotice, Loading } from "@/components/ui/States";
import { api, AuditType } from "@/lib/api";
import { describeError } from "@/lib/errors";
import { formatDuration, formatLedgerDateTime } from "@/lib/format";
import { looksLikeAddress } from "@/lib/hash";
import { useApi } from "@/lib/useApi";

type Role = "trustee" | "oracle" | "underwriter";

const AUDIT_TYPES: AuditType[] = ["KYC", "REGISTRY", "LENDING", "MORTGAGE", "TX", "SYSTEM"];

export default function AdminView() {
  const { stats } = useApp();
  // Kept in memory only: it stands in for the admin's signature.
  const [adminKey, setAdminKey] = useState("");

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="Platform admin" title="Roles and ledger">
        The admin registers trustees, oracles and underwriters. It has no path to anyone&apos;s money: no sweep, no
        forced transfer, and no way to release a tranche an inspector has not signed.
      </PageHeader>

      {!stats ? (
        <Loading />
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 [&>*]:min-w-0">
          <div className="space-y-6 lg:col-span-5">
            <Panel title="Admin">
              <dl>
                <Row label="Admin account">
                  <Address value={stats.admin} />
                </Row>
                <Row label="Ledger">{stats.ledger === "simulated" ? "Simulated" : `Soroban (${stats.network})`}</Row>
              </dl>
              {stats.ledger === "simulated" ? (
                <div className="mt-4">
                  <Field
                    label="Admin API key"
                    hint="The simulated ledger checks no signatures, so the backend's ADMIN_API_KEY stands in for the admin's. Kept in this tab's memory only."
                  >
                    {(id) => (
                      <TextInput
                        id={id}
                        type="password"
                        autoComplete="off"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                      />
                    )}
                  </Field>
                </div>
              ) : (
                <Callout className="mt-4">
                  Role changes are prepared for the admin account above to sign, usually a multisig. Connect it with
                  Freighter to sign here.
                </Callout>
              )}
            </Panel>
            <RoleForm adminKey={adminKey} />
            {stats.ledger === "simulated" && <TimeTravel />}
          </div>
          <div className="lg:col-span-7">
            <AuditLog />
          </div>
        </div>
      )}
    </main>
  );
}

function RoleForm({ adminKey }: { adminKey: string }) {
  const { accounts, runWrite, stats } = useApp();
  const [role, setRole] = useState<Role>("trustee");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState<boolean | null>(null);
  const valid = looksLikeAddress(address);
  const { data: current } = useApi(valid ? `roles:${address}` : null, () => api.roles(address));
  const needsKey = stats?.ledger === "simulated" && !adminKey;

  async function set(authorized: boolean) {
    setBusy(authorized);
    await runWrite(`${role} ${authorized ? "granted" : "revoked"}`, () =>
      api.setRole({ role, address, authorized }, adminKey || undefined),
    );
    setBusy(null);
  }

  return (
    <Panel title="Grant or revoke a role" description="Trustees and oracles live in the PropertyRegistry; underwriters in the MortgagePool.">
      <div className="space-y-4">
        <Field label="Role">
          {(id) => (
            <Select id={id} value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="trustee">Trustee</option>
              <option value="oracle">Oracle</option>
              <option value="underwriter">Underwriter</option>
            </Select>
          )}
        </Field>
        <Field label="Address" error={address && !valid ? "A Stellar address is 56 characters starting with G." : undefined}>
          {(id) => (
            <TextInput
              id={id}
              className="font-mono"
              placeholder="G…"
              value={address}
              onChange={(e) => setAddress(e.target.value.trim())}
            />
          )}
        </Field>
        {accounts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {accounts.map((a) => (
              <button
                key={a.address}
                type="button"
                onClick={() => setAddress(a.address)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  a.address === address ? "border-sky-500/50 bg-sky-500/15 text-sky-200" : "border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
        {current && (
          <div className="flex flex-wrap gap-2 text-xs">
            {(["trustee", "oracle", "underwriter"] as const).map((r) => (
              <Badge key={r} tone={current[r] ? "emerald" : "slate"}>
                {r}: {current[r] ? "yes" : "no"}
              </Badge>
            ))}
          </div>
        )}
        {needsKey && <p className="text-xs text-amber-300">Enter the admin API key above first.</p>}
        <div className="flex gap-3">
          <Button className="flex-1" variant="success" busy={busy === true} disabled={!valid || needsKey || busy !== null} onClick={() => set(true)}>
            Grant
          </Button>
          <Button className="flex-1" variant="danger" busy={busy === false} disabled={!valid || needsKey || busy !== null} onClick={() => set(false)}>
            Revoke
          </Button>
        </div>
      </div>
    </Panel>
  );
}

const JUMPS = [
  { label: "+1 day", seconds: 86_400 },
  { label: "+15 days", seconds: 15 * 86_400 },
  { label: "+30 days", seconds: 30 * 86_400 },
  { label: "+90 days", seconds: 90 * 86_400 },
];

function TimeTravel() {
  const { stats, notify, refresh } = useApp();
  const [busy, setBusy] = useState<number | null>(null);

  async function jump(seconds: number) {
    setBusy(seconds);
    try {
      await api.advanceTime(seconds);
      notify("success", `Ledger clock moved forward ${formatDuration(seconds)}`);
      refresh();
    } catch (err) {
      const { title, detail } = describeError(err);
      notify(
        "error",
        title === "Not found." ? "Time travel is disabled" : title,
        title === "Not found." ? "Start the backend with ALLOW_TIME_TRAVEL=true." : detail,
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel
      title="Ledger clock"
      description="Move the simulated ledger forward to watch interest accrue and loans fall into arrears. Needs ALLOW_TIME_TRAVEL=true on the backend."
    >
      <dl className="mb-4">
        <Row label="Ledger time">{stats ? formatLedgerDateTime(stats.ledgerTime) : "…"}</Row>
        <Row label="Billing month">{stats ? formatDuration(stats.rules.secondsPerMonth) : "…"}</Row>
        <Row label="Grace period">{stats ? formatDuration(stats.rules.graceSecs) : "…"}</Row>
      </dl>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {JUMPS.map((j) => (
          <Button key={j.seconds} size="sm" variant="secondary" busy={busy === j.seconds} disabled={busy !== null} onClick={() => jump(j.seconds)}>
            {j.label}
          </Button>
        ))}
      </div>
    </Panel>
  );
}

function AuditLog() {
  const [type, setType] = useState<AuditType | "">("");
  const [actor, setActor] = useState("");
  const [limit, setLimit] = useState(50);
  const actorFilter = looksLikeAddress(actor) ? actor : undefined;
  const { data, error } = useApi(`audit:${type}:${actorFilter ?? ""}:${limit}`, () =>
    api.audit({ type: type || undefined, actor: actorFilter, limit }),
  );
  const { data: summary } = useApi("audit-summary", () => api.auditSummary());

  return (
    <Panel title="Audit log" description="Everything the backend has done since it started, newest first.">
      {summary && (
        <div className="mb-4 flex flex-wrap gap-2">
          {AUDIT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(type === t ? "" : t)}
              aria-pressed={type === t}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                type === t ? "border-sky-500/50 bg-sky-500/15 text-sky-200" : "border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {t} <span className="text-slate-500">{summary.byType[t]}</span>
            </button>
          ))}
        </div>
      )}
      <div className="mb-4">
        <Field label="Filter by actor">
          {(id) => (
            <TextInput id={id} className="font-mono" placeholder="G…" value={actor} onChange={(e) => setActor(e.target.value.trim())} />
          )}
        </Field>
      </div>
      {error ? (
        <ErrorNotice error={error} />
      ) : !data ? (
        <Loading />
      ) : (
        <>
          <AuditList events={data.events} />
          {data.total > data.events.length && (
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => setLimit(Math.min(500, limit + 100))}>
              Show more ({data.total - data.events.length} older)
            </Button>
          )}
        </>
      )}
    </Panel>
  );
}
