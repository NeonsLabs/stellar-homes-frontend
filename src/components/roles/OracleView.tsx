"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { stageState } from "@/components/property/MilestoneTrack";
import { useApp } from "@/components/providers/AppProvider";
import Address from "@/components/ui/Address";
import Button from "@/components/ui/Button";
import { MissingRole, RequireAccount } from "@/components/ui/Gates";
import Panel from "@/components/ui/Panel";
import { EmptyState, ErrorNotice, Loading } from "@/components/ui/States";
import { api, Milestone, PropertyDetail } from "@/lib/api";
import { truncateHash, toBig } from "@/lib/format";
import { useRoles } from "@/lib/hooks";
import { scanProperties } from "@/lib/scan";
import { useApi } from "@/lib/useApi";

export default function OracleView() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="Oracle and inspector" title="Verification queue">
        Confirm titles against the land registry, publish surveyors&apos; valuations, and sign off construction stages.
        You never see properties you hold in trust: the contracts refuse an oracle acting on its own property.
      </PageHeader>
      <RequireAccount purpose="work as an oracle">
        <Oracle />
      </RequireAccount>
    </main>
  );
}

function Oracle() {
  const { account } = useApp();
  const { roles, loading } = useRoles();
  const address = account!.address;
  const { data, error } = useApi(roles?.oracle ? `oracle-queue:${address}` : null, async () =>
    (await scanProperties(["Pending", "Verified", "Mortgaged"])).filter((p) => p.trustee !== address),
  );

  if (!roles && loading) return <Loading label="Checking roles…" />;
  if (!roles?.oracle) return <MissingRole role="oracle" />;
  if (error) return <ErrorNotice error={error} />;
  if (!data) return <Loading label="Building the queue…" />;

  const titles = data.filter((p) => p.status === "Pending");
  const valuations = data.filter((p) => p.status !== "Pending" && toBig(p.usdcValue) === 0n);
  const stages = data.flatMap((p) =>
    p.milestones.filter((m) => stageState(p.milestones, m.stage) === "evidence").map((m) => ({ property: p, milestone: m })),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Titles to verify" action={<Count n={titles.length} />}>
        {titles.length === 0 ? (
          <EmptyState title="Nothing waiting" />
        ) : (
          <ul className="space-y-3">
            {titles.map((p) => (
              <TitleRow key={p.id} property={p} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Awaiting a valuation" action={<Count n={valuations.length} />}>
        {valuations.length === 0 ? (
          <EmptyState title="Nothing waiting" />
        ) : (
          <ul className="space-y-3">
            {valuations.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <div className="min-w-0 text-sm">
                  <p className="font-bold text-white">Property #{p.id}</p>
                  <p className="truncate font-mono text-xs text-slate-400">survey {truncateHash(p.surveyDocHash, 8, 8)}</p>
                </div>
                <Link href={`/properties/${p.id}`} className="glass-btn-secondary shrink-0">
                  Value
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Stages to sign off"
        description="Signed off in build order. Once you sign, anyone may release the stage's tranche to the trustee."
        action={<Count n={stages.length} />}
        className="lg:col-span-2"
      >
        {stages.length === 0 ? (
          <EmptyState title="No evidence waiting" />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {stages.map(({ property, milestone }) => (
              <StageRow key={`${property.id}:${milestone.stage}`} property={property} milestone={milestone} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${n ? "bg-amber-500/15 text-amber-300" : "bg-white/5 text-slate-500"}`}>
      {n}
    </span>
  );
}

function TitleRow({ property }: { property: PropertyDetail }) {
  const { account, runWrite } = useApp();
  const [busy, setBusy] = useState(false);
  return (
    <li className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-2">
        <Link href={`/properties/${property.id}`} className="font-bold text-white hover:text-sky-300">
          Property #{property.id}
        </Link>
        <Address value={property.trustee} />
      </div>
      <p className="font-mono text-xs break-all text-slate-400">title sha256 {property.titleHash}</p>
      <Button
        size="sm"
        busy={busy}
        onClick={async () => {
          setBusy(true);
          await runWrite(`Title of property #${property.id} verified`, () =>
            api.verifyTitle(property.id, account!.address),
          );
          setBusy(false);
        }}
      >
        Verify title
      </Button>
    </li>
  );
}

function StageRow({ property, milestone }: { property: PropertyDetail; milestone: Milestone }) {
  const { account, runWrite } = useApp();
  const [busy, setBusy] = useState(false);
  return (
    <li className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-2">
        <Link href={`/properties/${property.id}`} className="font-bold text-white hover:text-sky-300">
          Property #{property.id} · {milestone.name}
        </Link>
        <span className="text-xs text-slate-400">stage {milestone.stage + 1} of 5</span>
      </div>
      <p className="font-mono text-xs break-all text-slate-400">evidence sha256 {milestone.evidenceHash}</p>
      <Button
        size="sm"
        variant="success"
        busy={busy}
        onClick={async () => {
          setBusy(true);
          await runWrite(`${milestone.name} of property #${property.id} signed off`, () =>
            api.verifyMilestone(property.id, account!.address, milestone.stage),
          );
          setBusy(false);
        }}
      >
        Sign off {milestone.name.toLowerCase()}
      </Button>
    </li>
  );
}
