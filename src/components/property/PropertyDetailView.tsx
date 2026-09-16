"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuditTrail from "@/components/AuditTrail";
import { useApp } from "@/components/providers/AppProvider";
import Address from "@/components/ui/Address";
import { MortgageStatusBadge, PropertyStatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { AmountField } from "@/components/ui/Field";
import HashInput from "@/components/ui/HashInput";
import Panel, { Row } from "@/components/ui/Panel";
import ProgressBar from "@/components/ui/ProgressBar";
import { Callout, ErrorNotice, Loading } from "@/components/ui/States";
import { api, Milestone, PropertyDetail } from "@/lib/api";
import { maxPrincipal } from "@/lib/amortization";
import { formatUsdc, parseUsdc, percentOf, toBig, truncateHash } from "@/lib/format";
import { useRoles } from "@/lib/hooks";
import { useApi } from "@/lib/useApi";
import ApplyForm from "./ApplyForm";
import MilestoneTrack, { stageState } from "./MilestoneTrack";

export default function PropertyDetailView({ id }: { id: string }) {
  const { data: property, error } = useApi(`property:${id}`, () => api.property(id));

  if (error && !property) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <BackLink />
        <ErrorNotice error={error} />
      </main>
    );
  }
  if (!property) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Loading />
      </main>
    );
  }
  return <PropertyDetailBody property={property} />;
}

function BackLink() {
  return (
    <Link href="/properties" className="mb-6 inline-block text-sm text-slate-400 hover:text-white">
      ← All properties
    </Link>
  );
}

function PropertyDetailBody({ property }: { property: PropertyDetail }) {
  const { account } = useApp();
  const { roles } = useRoles();
  const valuation = toBig(property.usdcValue);
  const isTrustee = !!account && account.address === property.trustee;
  const isOracle = !!roles?.oracle && !isTrustee;
  const lendable = property.status === "Verified" && valuation > 0n && property.mortgageId === null;

  const { data: mortgage } = useApi(property.mortgageId && `mortgage:${property.mortgageId}`, () =>
    api.mortgage(property.mortgageId!),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <BackLink />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-bold tracking-wider text-sky-400 uppercase">PropertyRegistry</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Property #{property.id}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <PropertyStatusBadge status={property.status} />
            {isTrustee && <span className="text-sky-300">You hold this property in trust.</span>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 [&>*]:min-w-0">
        <div className="space-y-6 lg:col-span-7">
          <Panel
            title="Build schedule"
            description="Five stages, signed off in order by an inspector who is never the trustee. Each signed-off stage releases one fifth of the facility to the trustee."
            action={
              <span className="text-sm font-semibold text-slate-300">{property.verifiedStageCount} / 5 signed off</span>
            }
          >
            <ProgressBar
              value={property.verifiedStageCount * 20}
              label="Stages signed off"
              className="mb-5"
            />
            <MilestoneTrack
              milestones={property.milestones}
              tranches={mortgage?.tranches}
              renderActions={(m) => (
                <StageActions
                  property={property}
                  milestone={m}
                  isTrustee={isTrustee && !!roles?.trustee}
                  isOracle={isOracle}
                  mortgage={mortgage}
                />
              )}
            />
          </Panel>

          <Panel title="Activity" description="The backend's record of calls made against this property.">
            <AuditTrail kind="property" id={property.id} />
          </Panel>
        </div>

        <div className="order-first space-y-6 lg:order-none lg:col-span-5">
          <Panel title="Mortgage">
            {property.mortgageId ? (
              mortgage ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">Mortgage #{mortgage.id}</span>
                    <MortgageStatusBadge status={mortgage.status} />
                  </div>
                  <dl>
                    <Row label="Facility">{formatUsdc(mortgage.principal)}</Row>
                    <Row label="Released">{formatUsdc(mortgage.disbursed)}</Row>
                    <Row label="Borrower">
                      <Address value={mortgage.borrower} />
                    </Row>
                  </dl>
                  <ProgressBar
                    value={percentOf(mortgage.disbursed, mortgage.principal)}
                    label="Facility released"
                    tone="emerald"
                  />
                  <Link href={`/mortgages/${mortgage.id}`} className="glass-btn-secondary block text-center">
                    Open mortgage
                  </Link>
                </div>
              ) : (
                <Loading label="Loading mortgage…" />
              )
            ) : lendable ? (
              <ApplyForm property={property} />
            ) : (
              <Callout>
                {property.status === "Pending"
                  ? "An oracle must verify the title before anyone can borrow against this property."
                  : valuation === 0n
                    ? "A surveyor must publish a valuation before anyone can borrow against this property."
                    : "This property has no live mortgage and is not open for a new one."}
              </Callout>
            )}
          </Panel>

          <Panel title="Title and valuation">
            <dl>
              <Row label="Valuation">{valuation > 0n ? formatUsdc(valuation) : "Not valued"}</Row>
              <Row label="Max loan (80% LTV)">{valuation > 0n ? formatUsdc(maxPrincipal(valuation)) : "—"}</Row>
              <Row label="Trustee">
                <Address value={property.trustee} />
              </Row>
              <Row label="Title verified by">
                <Address value={property.verifiedBy} />
              </Row>
              <Row label="Valued by">
                <Address value={property.valuedBy} />
              </Row>
              <Row label="Title deed digest">
                <span className="font-mono text-xs" title={property.titleHash}>
                  {truncateHash(property.titleHash, 10, 10)}
                </span>
              </Row>
              <Row label="Survey digest">
                <span className="font-mono text-xs" title={property.surveyDocHash}>
                  {truncateHash(property.surveyDocHash, 10, 10)}
                </span>
              </Row>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Holding a copy of the deed? Its SHA-256 should match the digest above.
            </p>
          </Panel>

          {isOracle && <OracleTitlePanel property={property} />}
          {roles?.oracle && isTrustee && (
            <Callout tone="warning" title="You are this property's trustee">
              An oracle can never verify or value a property it holds in trust, even with both roles.
            </Callout>
          )}
        </div>
      </div>
    </main>
  );
}

function OracleTitlePanel({ property }: { property: PropertyDetail }) {
  const { account, runWrite } = useApp();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState<"title" | "value" | null>(null);
  const amount = parseUsdc(value);

  async function verifyTitle() {
    setBusy("title");
    await runWrite(`Title of property #${property.id} verified`, () => api.verifyTitle(property.id, account!.address));
    setBusy(null);
  }

  async function publishValuation(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    setBusy("value");
    const ok = await runWrite(`Property #${property.id} valued at ${formatUsdc(amount)}`, () =>
      api.setValuation(property.id, account!.address, amount.toString()),
    );
    setBusy(null);
    if (ok) setValue("");
  }

  return (
    <Panel title="Oracle" description="You are a registered oracle and not this property's trustee.">
      {property.status === "Pending" ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            Confirm the title digest against the land registry record, then verify it on-chain.
          </p>
          <Button block onClick={verifyTitle} busy={busy === "title"}>
            Verify title
          </Button>
        </div>
      ) : (
        <form onSubmit={publishValuation} className="space-y-3">
          <AmountField
            label={toBig(property.usdcValue) > 0n ? "Revalue" : "Publish valuation"}
            value={value}
            onChange={setValue}
            hint="The surveyor's figure. Loans are capped at 80% of it."
          />
          <Button type="submit" block busy={busy === "value"} disabled={!amount || amount <= 0n}>
            Publish valuation
          </Button>
        </form>
      )}
    </Panel>
  );
}

function StageActions({
  property,
  milestone,
  isTrustee,
  isOracle,
  mortgage,
}: {
  property: PropertyDetail;
  milestone: Milestone;
  isTrustee: boolean;
  isOracle: boolean;
  mortgage: Awaited<ReturnType<typeof api.mortgage>> | undefined;
}) {
  const { account, runWrite } = useApp();
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState(false);
  const state = stageState(property.milestones, milestone.stage);
  const canRelease =
    state === "verified" && !!mortgage && (mortgage.status === "Approved" || mortgage.status === "Funded");

  async function submitEvidence(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const ok = await runWrite(`${milestone.name} evidence submitted`, () =>
      api.submitEvidence(property.id, { trustee: account!.address, stage: milestone.stage, evidenceHash: hash }),
    );
    setBusy(false);
    if (ok) setHash("");
  }

  async function signOff() {
    setBusy(true);
    await runWrite(`${milestone.name} signed off`, () =>
      api.verifyMilestone(property.id, account!.address, milestone.stage),
    );
    setBusy(false);
  }

  async function release() {
    setBusy(true);
    await runWrite(`${milestone.name} tranche released to the trustee`, () =>
      api.disburse(mortgage!.id, milestone.stage, account?.address),
    );
    setBusy(false);
  }

  const parts: React.ReactNode[] = [];

  if (isTrustee && !milestone.verified) {
    parts.push(
      <form key="evidence" onSubmit={submitEvidence} className="space-y-2">
        <HashInput
          label={milestone.evidenceHash ? "Replace evidence" : "Submit evidence"}
          hint="Site photos and the inspection report, bundled into one file. Replaceable until signed off."
          value={hash}
          onChange={setHash}
          disabled={busy}
        />
        <Button type="submit" size="sm" busy={busy} disabled={!hash}>
          Submit {milestone.name.toLowerCase()} evidence
        </Button>
      </form>,
    );
  }
  if (isOracle && state === "evidence") {
    parts.push(
      <Button key="signoff" size="sm" variant="success" busy={busy} onClick={signOff}>
        Sign off {milestone.name.toLowerCase()}
      </Button>,
    );
  }
  if (isOracle && state === "blocked" && milestone.evidenceHash) {
    parts.push(
      <p key="order" className="text-xs text-slate-500">
        Evidence is in, but {property.milestones[milestone.stage - 1].name.toLowerCase()} must be signed off first.
      </p>,
    );
  }
  if (canRelease) {
    parts.push(
      account ? (
        <Button key="release" size="sm" busy={busy} onClick={release}>
          Release {formatUsdc(mortgage!.tranches[milestone.stage].amount)} to the trustee
        </Button>
      ) : (
        <p key="release" className="text-xs text-slate-400">
          Signed off and ready to release. Anyone may release it; connect an account to do so.
        </p>
      ),
    );
  }
  if (state === "verified" && mortgage?.status === "Repaying") {
    parts.push(
      <p key="locked" className="text-xs text-amber-300/90">
        Signed off, but repayments have started, and the contract releases no further tranches once they have.
      </p>,
    );
  }

  return parts.length ? <div className="mt-3 space-y-3 border-t border-white/5 pt-3">{parts}</div> : null;
}
