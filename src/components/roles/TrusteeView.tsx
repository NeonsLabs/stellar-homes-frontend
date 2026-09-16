"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { stageState } from "@/components/property/MilestoneTrack";
import { useApp } from "@/components/providers/AppProvider";
import { Badge, PropertyStatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { MissingRole, RequireAccount } from "@/components/ui/Gates";
import HashInput from "@/components/ui/HashInput";
import Panel from "@/components/ui/Panel";
import ProgressBar from "@/components/ui/ProgressBar";
import { EmptyState, ErrorNotice, Loading } from "@/components/ui/States";
import { api, PropertyDetail } from "@/lib/api";
import { formatUsdc, toBig } from "@/lib/format";
import { useRoles } from "@/lib/hooks";
import { scanProperties } from "@/lib/scan";
import { useApi } from "@/lib/useApi";

export default function TrusteeView() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="Trustee portal" title="Register plots and report progress">
        As a trustee you hold the property in trust, register it with the digests of its title deed and survey, submit
        evidence as each stage is built, and receive each tranche to pay for the build.
      </PageHeader>
      <RequireAccount purpose="work as a trustee">
        <Trustee />
      </RequireAccount>
    </main>
  );
}

function Trustee() {
  const { roles, loading } = useRoles();
  if (!roles && loading) return <Loading label="Checking roles…" />;
  return (
    <div className="grid gap-6 lg:grid-cols-12 [&>*]:min-w-0">
      <div className="space-y-6 lg:col-span-5">
        {roles?.trustee ? <RegisterForm /> : <MissingRole role="trustee" />}
      </div>
      <div className="lg:col-span-7">
        <MyProperties />
      </div>
    </div>
  );
}

function RegisterForm() {
  const { account, runWrite } = useApp();
  const router = useRouter();
  const [titleHash, setTitleHash] = useState("");
  const [surveyHash, setSurveyHash] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const outcome = await runWrite("Property registered", () =>
      api.submitProperty({ trustee: account!.address, titleHash, surveyDocHash: surveyHash }),
    );
    setBusy(false);
    const id =
      outcome?.mode === "simulated"
        ? outcome.response.property.id
        : outcome?.mode === "soroban" && outcome.submitted.returnValue !== undefined
          ? String(outcome.submitted.returnValue)
          : null;
    if (id) router.push(`/properties/${id}`);
  }

  return (
    <Panel
      title="Register a property"
      description="Only the SHA-256 digests go on-chain. The documents are hashed in your browser and never uploaded."
    >
      <form onSubmit={submit} className="space-y-4">
        <HashInput
          label="Title deed"
          value={titleHash}
          onChange={setTitleHash}
          hint="The land registry's title document for the plot."
        />
        <HashInput
          label="Survey report"
          value={surveyHash}
          onChange={setSurveyHash}
          hint="The licensed surveyor's report, which the valuation is based on."
        />
        <Button type="submit" block busy={busy} disabled={!titleHash || !surveyHash}>
          Register property
        </Button>
        <p className="text-xs leading-relaxed text-slate-500">
          The five build stages (foundation, walls, roofing, finishing, handover) are created with it. An oracle then
          verifies the title, and a surveyor publishes the valuation.
        </p>
      </form>
    </Panel>
  );
}

function MyProperties() {
  const { account } = useApp();
  const address = account!.address;
  const { data, error } = useApi(`trustee-properties:${address}`, async () =>
    (await scanProperties()).filter((p) => p.trustee === address),
  );

  return (
    <Panel title="Properties you hold in trust">
      {error ? (
        <ErrorNotice error={error} />
      ) : !data ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyState title="None yet">Properties you register appear here.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {[...data].reverse().map((p) => (
            <TrusteePropertyRow key={p.id} property={p} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function TrusteePropertyRow({ property }: { property: PropertyDetail }) {
  const next = property.milestones.find((m) => !m.verified);
  const nextState = next ? stageState(property.milestones, next.stage) : null;
  return (
    <li>
      <Link
        href={`/properties/${property.id}`}
        className="block rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-colors hover:border-sky-500/30"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-white">Property #{property.id}</span>
          <div className="flex items-center gap-2">
            {property.mortgageId && <Badge tone="violet">Mortgage #{property.mortgageId}</Badge>}
            <PropertyStatusBadge status={property.status} />
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>
              {next
                ? nextState === "evidence"
                  ? `${next.name}: evidence in, awaiting sign-off`
                  : `Next: submit ${next.name.toLowerCase()} evidence`
                : "All stages signed off"}
            </span>
            <span>{toBig(property.usdcValue) > 0n ? formatUsdc(property.usdcValue, { whole: true }) : "Not valued"}</span>
          </div>
          <ProgressBar value={property.verifiedStageCount * 20} label="Stages signed off" size="sm" />
        </div>
      </Link>
    </li>
  );
}
