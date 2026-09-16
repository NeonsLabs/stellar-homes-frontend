"use client";

import React from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { useApp } from "@/components/providers/AppProvider";
import { Badge } from "@/components/ui/Badge";
import { RequireAccount } from "@/components/ui/Gates";
import Panel from "@/components/ui/Panel";
import StatTile from "@/components/ui/StatTile";
import { Callout, EmptyState, ErrorNotice, Loading } from "@/components/ui/States";
import { api, ApiError, Mortgage } from "@/lib/api";
import { formatLedgerDate, formatUsdc, toBig } from "@/lib/format";
import { useProfile } from "@/lib/hooks";
import { scanLiveMortgages } from "@/lib/scan";
import { useApi } from "@/lib/useApi";
import MortgageCard from "./MortgageCard";
import MortgageLookup from "./MortgageLookup";

export default function DashboardView() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Borrower"
        title="My mortgages"
        action={
          <Link href="/properties" className="glass-btn-primary">
            Find a property
          </Link>
        }
      >
        Your loans, what has been released to your trustee, and what is due.
      </PageHeader>
      <RequireAccount purpose="see your mortgages">
        <Borrower />
      </RequireAccount>
    </main>
  );
}

/** The borrower's loans. The simulated ledger can list them all; on-chain the
 *  contract has no listing getter, so live loans are found via their properties. */
async function myMortgages(borrower: string): Promise<{ mortgages: Mortgage[]; complete: boolean }> {
  try {
    const { mortgages } = await api.mortgages({ borrower });
    return { mortgages, complete: true };
  } catch (err) {
    if (!(err instanceof ApiError && err.error === "NotSupported")) throw err;
    const live = await scanLiveMortgages();
    return {
      mortgages: live.map((x) => x.mortgage).filter((m) => m.borrower === borrower),
      complete: false,
    };
  }
}

function Borrower() {
  const { account } = useApp();
  const { profile } = useProfile();
  const address = account!.address;
  const { data, error } = useApi(`mortgages:${address}`, () => myMortgages(address));

  const mortgages = data?.mortgages ?? [];
  const live = mortgages.filter((m) => !["PaidOff", "Defaulted"].includes(m.status));
  const released = live.reduce((sum, m) => sum + toBig(m.disbursed), 0n);
  const owed = live.reduce((sum, m) => sum + toBig(m.outstanding), 0n);
  const nextDue = live
    .map((m) => toBig(m.nextPaymentDue))
    .filter((d) => d > 0n)
    .sort((a, b) => (a < b ? -1 : 1))[0];

  return (
    <div className="space-y-6">
      {profile === null && (
        <Callout tone="warning" title="Complete KYC to borrow">
          Mortgage applications are only prepared for verified wallets.{" "}
          <Link href="/kyc" className="font-semibold text-sky-300 underline">
            Verify now
          </Link>
          .
        </Callout>
      )}

      {error ? (
        <ErrorNotice error={error} />
      ) : !data ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile label="Live loans" value={String(live.length)} hint={`${mortgages.length} in total`} />
            <StatTile label="Released to trustees" value={formatUsdc(released, { whole: true })} accent="sky" />
            <StatTile label="Principal owed" value={formatUsdc(owed, { whole: true })} hint="Before this month's interest" />
            <StatTile
              label="Next payment"
              value={nextDue ? formatLedgerDate(nextDue.toString()) : "—"}
              accent="emerald"
              footer={profile && <Badge tone={profile.kycStatus === "Approved" ? "emerald" : "amber"}>KYC {profile.kycStatus}</Badge>}
            />
          </div>

          {mortgages.length === 0 ? (
            <EmptyState
              title="No mortgages yet"
              action={
                <Link href="/properties" className="glass-btn-primary">
                  Browse properties
                </Link>
              }
            >
              Apply against a property whose title has been verified and valued. You can borrow up to 80% of its
              valuation.
            </EmptyState>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...mortgages].reverse().map((m) => (
                <MortgageCard key={m.id} mortgage={m} />
              ))}
            </div>
          )}

          <Panel
            title="Look up a mortgage"
            description={
              data.complete
                ? undefined
                : "On deployed contracts only live loans can be found from their properties. Open a paid-off or defaulted loan by id."
            }
          >
            <MortgageLookup />
          </Panel>
        </>
      )}
    </div>
  );
}
