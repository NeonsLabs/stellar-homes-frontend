"use client";

import React, { useState } from "react";
import AuditTrail from "@/components/AuditTrail";
import PageHeader from "@/components/layout/PageHeader";
import { useApp } from "@/components/providers/AppProvider";
import Address from "@/components/ui/Address";
import Button from "@/components/ui/Button";
import { AmountField } from "@/components/ui/Field";
import { KycNeeded, RequireAccount } from "@/components/ui/Gates";
import Panel, { Row } from "@/components/ui/Panel";
import StatTile from "@/components/ui/StatTile";
import { ErrorNotice, Loading } from "@/components/ui/States";
import { api, PoolState } from "@/lib/api";
import { formatUsdc, parseUsdc, percentOf, toBig } from "@/lib/format";
import { useProfile } from "@/lib/hooks";
import { useApi } from "@/lib/useApi";

export default function InvestView() {
  const { data: pool, error } = useApi("pool", () => api.pool());

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="LendingPool" title="Invest in the pool">
        Deposit USDC to fund diaspora home builds. Interest from every mortgage is shared in proportion to what you put
        in. Capital committed to an approved mortgage cannot be withdrawn until it is repaid, and a defaulted loan&apos;s
        drawn balance is written off against the pool.
      </PageHeader>

      {error ? (
        <ErrorNotice error={error} />
      ) : !pool ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          <PoolOverview pool={pool} />
          <div className="grid gap-6 lg:grid-cols-12 [&>*]:min-w-0">
            <div className="lg:col-span-5">
              <RequireAccount purpose="invest">
                <InvestorPanel pool={pool} />
              </RequireAccount>
            </div>
            <div className="lg:col-span-7">
              <PoolBreakdown pool={pool} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function PoolOverview({ pool }: { pool: PoolState }) {
  // Capital is what the contract still holds; tranches move out of it into
  // `totalLent`. Reserved is committed to approved loans but not yet drawn.
  const lent = toBig(pool.totalLent);
  const deployed = lent + toBig(pool.totalReserved);
  const funds = toBig(pool.totalCapital) + lent;
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatTile
        label="Pool funds"
        value={formatUsdc(funds, { whole: true })}
        hint="Held by the pool, plus lent to trustees"
      />
      <StatTile
        label="Available"
        value={formatUsdc(pool.available, { whole: true })}
        hint="Neither committed nor lent"
        accent="emerald"
      />
      <StatTile
        label="Deployed"
        value={`${percentOf(deployed, funds).toFixed(1)}%`}
        hint={`${formatUsdc(lent, { whole: true })} lent, ${formatUsdc(pool.totalReserved, { whole: true })} committed`}
        accent="sky"
      />
      <StatTile
        label="Interest earned"
        value={formatUsdc(pool.totalInterest)}
        hint={`${formatUsdc(pool.totalWrittenOff, { whole: true })} written off`}
        accent="amber"
      />
    </div>
  );
}

function PoolBreakdown({ pool }: { pool: PoolState }) {
  const segments = [
    { label: "Lent to trustees", value: toBig(pool.totalLent), className: "bg-sky-500" },
    { label: "Committed, not yet drawn", value: toBig(pool.totalReserved), className: "bg-violet-500" },
    { label: "Available", value: toBig(pool.available), className: "bg-emerald-500" },
  ];
  const whole = segments.reduce((s, x) => s + x.value, 0n);

  return (
    <Panel
      title="Where the money is"
      description="The LendingPool contract holds everything not yet lent. Tranches go to the trustee running the build, never to the borrower."
    >
      <div
        className="mb-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-slate-800"
        role="img"
        aria-label={segments.map((s) => `${s.label} ${formatUsdc(s.value)}`).join(", ")}
      >
        {whole > 0n &&
          segments.map(
            (s) =>
              s.value > 0n && (
                <div key={s.label} className={s.className} style={{ width: `${percentOf(s.value, whole)}%` }} />
              ),
          )}
      </div>
      <dl>
        {segments.map((s) => (
          <Row
            key={s.label}
            label={
              <span className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-sm ${s.className}`} />
                {s.label}
              </span>
            }
          >
            {formatUsdc(s.value)}
          </Row>
        ))}
        <Row label="Held by the pool">{formatUsdc(pool.totalCapital)}</Row>
        <Row label="Pool shares">{formatUsdc(pool.totalShares).replace("$", "")}</Row>
        {pool.heldByPool !== undefined && <Row label="USDC held by the contract">{formatUsdc(pool.heldByPool)}</Row>}
        <Row label="Settlement asset">
          <Address value={pool.settlementToken} />
        </Row>
      </dl>
    </Panel>
  );
}

function InvestorPanel({ pool }: { pool: PoolState }) {
  const { account, runWrite } = useApp();
  const { profile } = useProfile();
  const address = account!.address;
  const { data: position, error } = useApi(`investor:${address}`, () => api.investor(address));
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState<"move" | "claim" | null>(null);

  const amount = parseUsdc(value);
  const shares = toBig(position?.shares);
  const available = toBig(pool.available);
  const withdrawable = shares < available ? shares : available;
  const claimable = toBig(position?.claimableInterest);
  const overLimit = tab === "withdraw" && amount !== null && amount > withdrawable;

  async function move(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || amount <= 0n || overLimit) return;
    setBusy("move");
    const ok =
      tab === "deposit"
        ? await runWrite(`Deposited ${formatUsdc(amount)}`, () => api.deposit(address, amount.toString()))
        : await runWrite(`Withdrew ${formatUsdc(amount)}`, () => api.withdraw(address, amount.toString()));
    setBusy(null);
    if (ok) setValue("");
  }

  async function claim() {
    setBusy("claim");
    await runWrite(`Claimed ${formatUsdc(claimable)} of interest`, () => api.claim(address));
    setBusy(null);
  }

  if (error) return <ErrorNotice error={error} />;
  if (!position) return <Loading label="Loading your position…" />;

  return (
    <div className="space-y-6">
      <Panel title="Your position">
        <dl>
          <Row label="Deposited">{formatUsdc(shares)}</Row>
          <Row label="Share of the pool">{percentOf(shares, pool.totalShares).toFixed(2)}%</Row>
          <Row label="Claimable interest">
            <span className="text-emerald-300">{formatUsdc(claimable)}</span>
          </Row>
        </dl>
        <Button block variant="success" className="mt-4" busy={busy === "claim"} disabled={claimable <= 0n} onClick={claim}>
          Claim interest
        </Button>
      </Panel>

      <Panel>
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1" role="tablist">
          {(["deposit", "withdraw"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => {
                setTab(t);
                setValue("");
              }}
              className={`rounded-lg py-2 text-sm font-semibold capitalize ${tab === t ? "bg-sky-500/20 text-white" : "text-slate-400"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "deposit" && profile?.kycStatus !== "Approved" ? (
          <KycNeeded action="deposit" />
        ) : (
          <form onSubmit={move} className="space-y-4">
            <AmountField
              label={tab === "deposit" ? "Deposit" : "Withdraw"}
              value={value}
              onChange={setValue}
              max={tab === "withdraw" ? withdrawable : undefined}
              hint={
                tab === "withdraw"
                  ? `You can withdraw up to ${formatUsdc(withdrawable)}: your deposit, limited by capital not committed to mortgages.`
                  : "Transferred from your wallet in USDC. You receive pool shares one-for-one."
              }
            />
            {overLimit && <p className="-mt-2 text-xs text-rose-300">That is more than you can withdraw right now.</p>}
            <Button type="submit" block busy={busy === "move"} disabled={!amount || amount <= 0n || overLimit}>
              {tab === "deposit" ? "Deposit" : "Withdraw"} {amount ? formatUsdc(amount) : ""}
            </Button>
          </form>
        )}
      </Panel>

      <Panel title="Your activity">
        <AuditTrail kind="investor" id={address} />
      </Panel>
    </div>
  );
}
