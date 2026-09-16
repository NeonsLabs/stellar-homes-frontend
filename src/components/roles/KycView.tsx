"use client";

import React, { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useApp } from "@/components/providers/AppProvider";
import Address from "@/components/ui/Address";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Field, { Select, TextInput } from "@/components/ui/Field";
import { RequireAccount } from "@/components/ui/Gates";
import Panel, { Row } from "@/components/ui/Panel";
import { Callout, Loading } from "@/components/ui/States";
import { api, KycRole } from "@/lib/api";
import { describeError } from "@/lib/errors";
import { useProfile, useRoles } from "@/lib/hooks";

const ROLES: { value: KycRole; label: string }[] = [
  { value: "Borrower", label: "Borrower: build a home with a mortgage" },
  { value: "Investor", label: "Investor: fund the lending pool" },
  { value: "Trustee", label: "Trustee: hold properties and run builds" },
  { value: "Oracle", label: "Oracle: verify titles and inspect builds" },
  { value: "Underwriter", label: "Underwriter: approve applications" },
];

const DOCUMENTS = ["Passport", "National ID", "Driver's licence", "Residence permit"];

export default function KycView() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="Identity" title="KYC verification">
        Identity is checked off-chain and never reaches the ledger. The contracts only ever see your wallet address, but
        the backend prepares borrowing and investing transactions only for verified wallets.
      </PageHeader>
      <RequireAccount purpose="verify your identity">
        <Kyc />
      </RequireAccount>
    </main>
  );
}

function Kyc() {
  const { account, notify, refresh } = useApp();
  const { profile, loading } = useProfile();
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState(DOCUMENTS[0]);
  const [documentNumber, setDocumentNumber] = useState("");
  const [role, setRole] = useState<KycRole>("Borrower");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.verifyKyc({
        address: account!.address,
        name: name.trim(),
        documentType,
        documentNumber: documentNumber.trim(),
        role,
      });
      notify("success", res.message);
      setEditing(false);
      refresh();
    } catch (err) {
      const { title, detail } = describeError(err);
      notify("error", title, detail);
    } finally {
      setBusy(false);
    }
  }

  const showForm = profile === null || editing;

  return (
    <div className="grid gap-6 lg:grid-cols-12 [&>*]:min-w-0">
      <div className="lg:col-span-7">
        {loading && profile === undefined ? (
          <Loading label="Checking KYC…" />
        ) : showForm ? (
          <Panel
            title="Verify this wallet"
            description="Checked by Smile ID. In this build the check is a stand-in that approves straight away."
          >
            <form onSubmit={submit} className="space-y-4">
              <Field label="Wallet">{() => <Address value={account!.address} full />}</Field>
              <Field label="Full legal name">
                {(id) => (
                  <TextInput id={id} required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                )}
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Document">
                  {(id) => (
                    <Select id={id} value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                      {DOCUMENTS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field label="Document number">
                  {(id) => (
                    <TextInput
                      id={id}
                      required
                      autoComplete="off"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                    />
                  )}
                </Field>
              </div>
              <Field
                label="I am joining as"
                hint="Trustee, oracle and underwriter are also on-chain roles, which only the contracts' admin can grant."
              >
                {(id) => (
                  <Select id={id} value={role} onChange={(e) => setRole(e.target.value as KycRole)}>
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <div className="flex gap-3">
                <Button type="submit" busy={busy} disabled={!name.trim() || !documentNumber.trim()} className="flex-1">
                  Submit for verification
                </Button>
                {editing && (
                  <Button variant="secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Panel>
        ) : profile ? (
          <Panel
            title={profile.name}
            action={
              <Badge tone={profile.kycStatus === "Approved" ? "emerald" : profile.kycStatus === "Rejected" ? "rose" : "amber"} dot>
                KYC {profile.kycStatus}
              </Badge>
            }
          >
            <dl>
              <Row label="Wallet">
                <Address value={profile.address} />
              </Row>
              <Row label="Joined as">{profile.role}</Row>
            </dl>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => setEditing(true)}>
              Update details
            </Button>
          </Panel>
        ) : (
          <Callout tone="warning">Could not load the KYC profile.</Callout>
        )}
      </div>

      <div className="lg:col-span-5">
        <Panel title="On-chain roles" description="What the contracts recognise for this address.">
          {profile ? (
            <dl>
              {(["trustee", "oracle", "underwriter"] as const).map((r) => (
                <Row key={r} label={<span className="capitalize">{r}</span>}>
                  {profile.onChainRoles[r] ? <Badge tone="emerald">Registered</Badge> : <Badge>Not registered</Badge>}
                </Row>
              ))}
            </dl>
          ) : (
            <RolesOnly />
          )}
        </Panel>
      </div>
    </div>
  );
}

function RolesOnly() {
  const { roles } = useRoles();
  if (!roles) return <Loading label="Reading roles…" />;
  return (
    <dl>
      {(["trustee", "oracle", "underwriter"] as const).map((r) => (
        <Row key={r} label={<span className="capitalize">{r}</span>}>
          {roles[r] ? <Badge tone="emerald">Registered</Badge> : <Badge>Not registered</Badge>}
        </Row>
      ))}
    </dl>
  );
}
