"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuditTrail from "@/components/AuditTrail";
import { stageState } from "@/components/property/MilestoneTrack";
import { useApp } from "@/components/providers/AppProvider";
import Address from "@/components/ui/Address";
import { Badge, MORTGAGE_META, MortgageStatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { AmountField } from "@/components/ui/Field";
import Panel, { Row } from "@/components/ui/Panel";
import ProgressBar from "@/components/ui/ProgressBar";
import StatTile from "@/components/ui/StatTile";
import { Callout, EmptyState, ErrorNotice, Loading } from "@/components/ui/States";
import { api, MortgageDetail, PropertyDetail } from "@/lib/api";
import { BPS_DENOMINATOR, MAX_LTV_BPS } from "@/lib/amortization";
import {
  formatBps,
  formatLedgerDate,
  formatLedgerDateTime,
  formatRelative,
  formatUsdc,
  parseUsdc,
  percentOf,
  toBig,
  toUsdcString,
} from "@/lib/format";
import { useRoles } from "@/lib/hooks";
import { useApi } from "@/lib/useApi";
import ScheduleTable from "./ScheduleTable";

export default function MortgageDetailView({ id }: { id: string }) {
  const { data: mortgage, error } = useApi(`mortgage:${id}`, () => api.mortgage(id));
  const { data: property } = useApi(mortgage ? `property:${mortgage.propertyId}` : null, () =>
    api.property(mortgage!.propertyId),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link href="/dashboard" className="mb-6 inline-block text-sm text-slate-400 hover:text-white">
        ← My mortgages
      </Link>
      {error && !mortgage ? (
        <ErrorNotice error={error} />
      ) : !mortgage ? (
        <Loading />
      ) : (
        <MortgageBody mortgage={mortgage} property={property} />
      )}
    </main>
  );
}

function MortgageBody({ mortgage, property }: { mortgage: MortgageDetail; property: PropertyDetail | undefined }) {
  const { account, stats } = useApp();
  const { roles } = useRoles();
  // Ledger time, not the wall clock: the simulated ledger can be moved forward.
  const now = toBig(stats?.ledgerTime);
  const grace = toBig(stats?.rules.graceSecs ?? 0);
  const isBorrower = account?.address === mortgage.borrower;
  const drawing = mortgage.status === "Approved" || mortgage.status === "Funded";
  const repayable = mortgage.status === "Funded" || mortgage.status === "Repaying";
  const due = toBig(mortgage.nextPaymentDue);
  const overdue = !!stats && repayable && due > 0n && now > due;

  return (
    <>
      <div className="mb-8 space-y-2">
        <p className="text-xs font-bold tracking-wider text-sky-400 uppercase">MortgagePool</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Mortgage #{mortgage.id}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <MortgageStatusBadge status={mortgage.status} />
          <span>
            against{" "}
            <Link href={`/properties/${mortgage.propertyId}`} className="font-semibold text-sky-300 hover:underline">
              property #{mortgage.propertyId}
            </Link>
          </span>
          {isBorrower && <span className="text-sky-300">You are the borrower.</span>}
        </div>
        <p className="max-w-3xl text-sm text-slate-400">{MORTGAGE_META[mortgage.status].hint}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Released"
          value={formatUsdc(mortgage.disbursed, { whole: true })}
          hint={`of a ${formatUsdc(mortgage.principal, { whole: true })} facility`}
          accent="sky"
          footer={
            <ProgressBar value={percentOf(mortgage.disbursed, mortgage.principal)} label="Facility released" size="sm" />
          }
        />
        <StatTile
          label="Owed now"
          value={formatUsdc(mortgage.live.payoffAmount)}
          hint={`${formatUsdc(mortgage.live.outstanding)} principal + ${formatUsdc(mortgage.live.interestAccrued)} interest`}
        />
        <StatTile
          label="Instalment due"
          value={repayable ? formatUsdc(mortgage.live.amountDue) : "—"}
          hint={
            repayable
              ? `${overdue ? "was due" : "due"} ${formatLedgerDate(mortgage.nextPaymentDue)}${stats ? ` (${formatRelative(mortgage.nextPaymentDue, now)})` : ""}`
              : "Starts a month after the first tranche"
          }
          accent={overdue ? "amber" : "emerald"}
        />
        <StatTile
          label="Repaid"
          value={formatUsdc(mortgage.totalRepaid, { whole: true })}
          hint={`${mortgage.paymentsMade} payment${mortgage.paymentsMade === 1 ? "" : "s"}, ${formatUsdc(mortgage.interestPaid)} interest`}
        />
      </div>

      {mortgage.live.isDefaultable ? (
        <DefaultPanel mortgage={mortgage} />
      ) : (
        overdue && (
          <Callout tone="warning" title="Instalment overdue" className="mb-6">
            The instalment was due {formatLedgerDateTime(mortgage.nextPaymentDue)}. If it is still unpaid after{" "}
            {formatLedgerDateTime((due + grace).toString())}, anyone may write the loan off.
          </Callout>
        )
      )}

      <div className="grid gap-6 lg:grid-cols-12 [&>*]:min-w-0">
        <div className="space-y-6 lg:col-span-7">
          {mortgage.status === "Applied" && roles?.underwriter && <UnderwriterPanel mortgage={mortgage} property={property} />}

          <Panel
            title="Tranches"
            description="One fifth of the facility per construction stage, paid to the trustee once an inspector signs the stage off."
          >
            {property ? (
              <TrancheTable mortgage={mortgage} property={property} canRelease={drawing} />
            ) : (
              <Loading label="Loading build schedule…" />
            )}
            {mortgage.status === "Repaying" && toBig(mortgage.disbursed) < toBig(mortgage.principal) && (
              <Callout tone="warning" className="mt-4">
                Repayments have started, and the contract releases tranches only for Approved or Funded loans. The
                undrawn {formatUsdc(toBig(mortgage.principal) - toBig(mortgage.disbursed))} returns to the pool when the
                loan is paid off.
              </Callout>
            )}
          </Panel>

          <Panel
            title="Repayment schedule"
            description="Projected with the contract's arithmetic, assuming every instalment is paid on its due date and nothing more is drawn. The contract is the source of truth."
          >
            {repayable ? (
              <ScheduleTable mortgageId={mortgage.id} now={now} />
            ) : (
              <EmptyState title="No schedule yet">
                The first instalment falls due one month after the first tranche is released.
              </EmptyState>
            )}
          </Panel>

          <Panel title="Payments">
            <RepaymentHistory mortgageId={mortgage.id} />
          </Panel>

          <Panel title="Activity">
            <AuditTrail kind="mortgage" id={mortgage.id} />
          </Panel>
        </div>

        <div className="order-first space-y-6 lg:order-none lg:col-span-5">
          {isBorrower && repayable && <RepayPanel mortgage={mortgage} />}
          {!isBorrower && repayable && (
            <Callout>Only the borrower can repay. Switch to the borrower&apos;s account to make a payment.</Callout>
          )}

          <Panel title="Terms">
            <dl>
              <Row label="Borrower">
                <Address value={mortgage.borrower} />
              </Row>
              <Row label="Facility">{formatUsdc(mortgage.principal)}</Row>
              <Row label="Rate">{formatBps(mortgage.rateBps)} a year, charged monthly</Row>
              <Row label="Term">
                {mortgage.termMonths} months ({formatUsdc(toBig(mortgage.principal) / BigInt(mortgage.termMonths))} principal
                a month)
              </Row>
              <Row label="Applied">{formatLedgerDateTime(mortgage.createdAt)}</Row>
              {toBig(mortgage.lastAccruedAt) > 0n && (
                <Row label="Interest charged to">{formatLedgerDateTime(mortgage.lastAccruedAt)}</Row>
              )}
              {property && toBig(property.usdcValue) > 0n && (
                <Row label="Loan-to-value">{percentOf(mortgage.principal, property.usdcValue).toFixed(2)}%</Row>
              )}
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}

function TrancheTable({
  mortgage,
  property,
  canRelease,
}: {
  mortgage: MortgageDetail;
  property: PropertyDetail;
  canRelease: boolean;
}) {
  const { account, runWrite } = useApp();
  const [busy, setBusy] = useState<number | null>(null);

  async function release(stage: number) {
    setBusy(stage);
    await runWrite(`${mortgage.tranches[stage].name} tranche released to the trustee`, () =>
      api.disburse(mortgage.id, stage, account?.address),
    );
    setBusy(null);
  }

  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 uppercase">
            <th className="px-2 py-2 font-semibold">Stage</th>
            <th className="px-2 py-2 text-right font-semibold">Tranche</th>
            <th className="px-2 py-2 font-semibold">Status</th>
            <th className="px-2 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {mortgage.tranches.map((t) => {
            const state = stageState(property.milestones, t.stage);
            return (
              <tr key={t.stage}>
                <td className="px-2 py-3 font-semibold text-white">
                  {t.stage + 1}. {t.name}
                </td>
                <td className="px-2 py-3 text-right font-mono text-slate-200">{formatUsdc(t.amount)}</td>
                <td className="px-2 py-3">
                  {state === "released" ? (
                    <Badge tone="emerald">Released</Badge>
                  ) : state === "verified" ? (
                    <Badge tone="sky">Signed off</Badge>
                  ) : state === "evidence" ? (
                    <Badge tone="amber">Awaiting sign-off</Badge>
                  ) : (
                    <Badge>Not signed off</Badge>
                  )}
                </td>
                <td className="px-2 py-3 text-right">
                  {state === "verified" && canRelease && (
                    <Button size="sm" busy={busy === t.stage} disabled={!account} onClick={() => release(t.stage)}>
                      Release
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {canRelease && !account && (
        <p className="px-2 pt-2 text-xs text-slate-500">Anyone may release a signed-off stage. Connect an account to do so.</p>
      )}
      <p className="px-2 pt-3 text-xs text-slate-500">
        Evidence and sign-off happen on the{" "}
        <Link href={`/properties/${property.id}`} className="text-sky-300 hover:underline">
          property page
        </Link>
        .
      </p>
    </div>
  );
}

function RepayPanel({ mortgage }: { mortgage: MortgageDetail }) {
  const { account, runWrite } = useApp();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const amount = parseUsdc(value);
  const due = toBig(mortgage.live.amountDue);
  const payoff = toBig(mortgage.live.payoffAmount);
  const tooLittle = amount !== null && amount > 0n && amount < due && amount < payoff;

  async function repay(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || tooLittle) return;
    setBusy(true);
    const outcome = await runWrite(amount >= payoff ? "Mortgage paid off" : `Paid ${formatUsdc(amount)}`, () =>
      api.repay(mortgage.id, account!.address, amount.toString()),
    );
    setBusy(false);
    if (outcome) setValue("");
  }

  return (
    <Panel title="Make a payment" description="Payments clear interest first, then principal. Paying more than the instalment shortens the loan.">
      <form onSubmit={repay} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setValue(toUsdcString(due))}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left hover:border-sky-500/40"
          >
            <span className="block text-xs text-slate-400">Instalment due</span>
            <span className="font-bold text-white">{formatUsdc(due)}</span>
          </button>
          <button
            type="button"
            onClick={() => setValue(toUsdcString(payoff))}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left hover:border-emerald-500/40"
          >
            <span className="block text-xs text-slate-400">Pay off in full</span>
            <span className="font-bold text-white">{formatUsdc(payoff)}</span>
          </button>
        </div>
        <AmountField label="Amount" value={value} onChange={setValue} />
        {tooLittle && (
          <p className="-mt-2 text-xs text-rose-300">
            The contract accepts at least the instalment due ({formatUsdc(due)}), or the full payoff.
          </p>
        )}
        {amount !== null && amount > payoff && (
          <p className="-mt-2 text-xs text-slate-400">Only the {formatUsdc(payoff)} owed will be taken.</p>
        )}
        <Button type="submit" variant="success" block busy={busy} disabled={!amount || amount <= 0n || tooLittle}>
          Pay {amount ? formatUsdc(amount > payoff ? payoff : amount) : ""}
        </Button>
        <p className="text-xs leading-relaxed text-slate-500">
          Figures include interest up to now and move as whole months pass. The payment is made in the settlement
          asset (USDC) from your wallet.
        </p>
      </form>
    </Panel>
  );
}

function UnderwriterPanel({ mortgage, property }: { mortgage: MortgageDetail; property: PropertyDetail | undefined }) {
  const { account, runWrite } = useApp();
  const router = useRouter();
  const { data: pool } = useApi("pool", () => api.pool());
  const [busy, setBusy] = useState<"approve" | "decline" | null>(null);
  const principal = toBig(mortgage.principal);
  const valuation = toBig(property?.usdcValue);
  const withinLtv = principal * BPS_DENOMINATOR <= valuation * MAX_LTV_BPS;
  const available = toBig(pool?.available);
  const funded = pool ? principal <= available : true;

  async function approve() {
    setBusy("approve");
    await runWrite(`Mortgage #${mortgage.id} approved`, () => api.approve(mortgage.id, account!.address));
    setBusy(null);
  }

  async function decline() {
    setBusy("decline");
    const outcome = await runWrite(`Mortgage #${mortgage.id} declined`, () => api.decline(mortgage.id, account!.address));
    setBusy(null);
    // A declined application is deleted from the contract.
    if (outcome) router.push("/underwriter");
  }

  return (
    <Panel
      title="Underwriting decision"
      description="Approving commits the whole facility against the pool's capital straight away."
      className="border-amber-500/30"
    >
      <dl className="mb-4">
        <Row label="Loan-to-value">
          <span className={withinLtv ? "text-emerald-300" : "text-rose-300"}>
            {valuation > 0n ? `${percentOf(principal, valuation).toFixed(2)}%` : "—"} (cap 80%)
          </span>
        </Row>
        <Row label="Pool capital available">
          <span className={funded ? "text-emerald-300" : "text-rose-300"}>{pool ? formatUsdc(available) : "…"}</span>
        </Row>
        <Row label="Rate requested">{formatBps(mortgage.rateBps)}</Row>
      </dl>
      {!funded && (
        <Callout tone="warning" className="mb-4">
          The pool cannot commit {formatUsdc(principal)} until investors deposit more.
        </Callout>
      )}
      <div className="flex gap-3">
        <Button variant="success" className="flex-1" busy={busy === "approve"} disabled={!!busy || !funded || !withinLtv} onClick={approve}>
          Approve and commit
        </Button>
        <Button variant="danger" className="flex-1" busy={busy === "decline"} disabled={!!busy} onClick={decline}>
          Decline
        </Button>
      </div>
    </Panel>
  );
}

function DefaultPanel({ mortgage }: { mortgage: MortgageDetail }) {
  const { account, runWrite } = useApp();
  const [busy, setBusy] = useState(false);

  async function writeOff() {
    setBusy(true);
    await runWrite(`Mortgage #${mortgage.id} written off`, () => api.markDefault(mortgage.id, account?.address));
    setBusy(false);
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4">
      <div className="max-w-2xl text-sm">
        <p className="font-semibold text-rose-200">Past its grace period</p>
        <p className="mt-1 text-slate-300">
          An instalment is unpaid beyond the grace period, so anyone may write this loan off. The undrawn facility
          returns to the pool; the {formatUsdc(mortgage.live.outstanding)} drawn balance is written off against
          investors&apos; capital.
        </p>
      </div>
      <Button variant="danger" busy={busy} disabled={!account} onClick={writeOff}>
        Write off
      </Button>
    </div>
  );
}

function RepaymentHistory({ mortgageId }: { mortgageId: string }) {
  const { data, error } = useApi(`repayments:${mortgageId}`, () => api.repayments(mortgageId));
  if (error) return <ErrorNotice error={error} />;
  if (!data) return <Loading label="Loading payments…" />;
  if (data.repayments.length === 0) return <EmptyState title="No payments yet" />;
  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 uppercase">
            <th className="px-2 py-2 font-semibold">Date</th>
            <th className="px-2 py-2 text-right font-semibold">Paid</th>
            <th className="px-2 py-2 text-right font-semibold">Interest</th>
            <th className="px-2 py-2 text-right font-semibold">Principal</th>
            <th className="px-2 py-2 font-semibold">Transaction</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {[...data.repayments].reverse().map((r, i) => (
            <tr key={`${r.ledger}-${i}`}>
              <td className="px-2 py-2.5 text-slate-300">{formatLedgerDateTime(r.timestamp)}</td>
              <td className="px-2 py-2.5 text-right font-mono text-white">{formatUsdc(r.amount)}</td>
              <td className="px-2 py-2.5 text-right font-mono text-slate-300">{formatUsdc(r.interest)}</td>
              <td className="px-2 py-2.5 text-right font-mono text-slate-300">{formatUsdc(r.principal)}</td>
              <td className="px-2 py-2.5">
                {r.txHash ? <Address value={r.txHash} /> : <span className="text-xs text-slate-500">ledger {r.ledger}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!data.complete && (
        <p className="px-2 pt-3 text-xs text-slate-500">
          The RPC node keeps only recent events, so older payments are missing here. The totals above include every
          payment.
        </p>
      )}
    </div>
  );
}
