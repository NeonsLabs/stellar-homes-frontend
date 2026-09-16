"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { Callout } from "./States";

/** Renders children only when an account is active. */
export function RequireAccount({ children, purpose }: { children: React.ReactNode; purpose: string }) {
  const { account } = useApp();
  if (!account) {
    return (
      <Callout title="Connect an account">
        Choose an account with the <span className="font-semibold text-white">Connect</span> button to {purpose}.
      </Callout>
    );
  }
  return <>{children}</>;
}

/** Explains that the active account lacks an on-chain role. */
export function MissingRole({ role }: { role: "trustee" | "oracle" | "underwriter" }) {
  const { stats } = useApp();
  return (
    <Callout tone="warning" title={`This account is not a registered ${role}`}>
      {role === "underwriter" ? "Underwriters are registered in the MortgagePool" : "The PropertyRegistry holds that role"}
      , and only the contracts&apos; admin can grant it.{" "}
      {stats?.ledger === "simulated" ? (
        <>
          On the simulated ledger you can grant it on the{" "}
          <Link href="/admin" className="font-semibold text-sky-300 underline">
            admin page
          </Link>
          .
        </>
      ) : (
        "Ask the platform's admin multisig to register this address."
      )}
    </Callout>
  );
}

/** Explains that the active account has not completed KYC. */
export function KycNeeded({ action }: { action: string }) {
  return (
    <Callout tone="warning" title="KYC required">
      The backend only prepares transactions to {action} for a verified wallet.{" "}
      <Link href="/kyc" className="font-semibold text-sky-300 underline">
        Complete KYC
      </Link>{" "}
      first.
    </Callout>
  );
}
