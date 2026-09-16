"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import Button from "@/components/ui/Button";
import Field, { AmountField, TextInput } from "@/components/ui/Field";
import { KycNeeded, RequireAccount } from "@/components/ui/Gates";
import { Loading } from "@/components/ui/States";
import { api, PropertyDetail } from "@/lib/api";
import { DEFAULT_RATE_BPS, MAX_RATE_BPS, maxPrincipal, projectFullyDrawn, trancheFor } from "@/lib/amortization";
import { formatBps, formatUsdc, parseUsdc, toBig } from "@/lib/format";
import { useProfile } from "@/lib/hooks";

const TERMS = [60, 120, 180, 240];

export default function ApplyForm({ property }: { property: PropertyDetail }) {
  const { account, runWrite } = useApp();
  const { profile, loading } = useProfile();
  const router = useRouter();
  const valuation = toBig(property.usdcValue);
  const cap = maxPrincipal(valuation);

  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("120");
  const [rate, setRate] = useState((DEFAULT_RATE_BPS / 100).toFixed(2));
  const [busy, setBusy] = useState(false);

  const principal = parseUsdc(amount);
  const termMonths = /^\d+$/.test(term) ? Number(term) : 0;
  const rateBps = /^\d+(\.\d{1,2})?$/.test(rate) ? Math.round(Number(rate) * 100) : -1;

  const principalError =
    principal !== null && principal > cap ? `The contract caps this property at ${formatUsdc(cap)} (80% LTV).` : undefined;
  const termError = term && (termMonths < 1 || termMonths > 4_294_967_295) ? "At least one month." : undefined;
  const rateError =
    rate && (rateBps < 0 || rateBps > MAX_RATE_BPS) ? `Between 0% and ${formatBps(MAX_RATE_BPS)}.` : undefined;

  const valid = principal !== null && principal > 0n && !principalError && termMonths >= 1 && !termError && rateBps >= 0 && !rateError;
  const projection = valid ? projectFullyDrawn(principal!, termMonths, rateBps) : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!account || !valid) return;
    setBusy(true);
    const outcome = await runWrite("Mortgage application submitted", () =>
      api.apply({
        borrower: account.address,
        propertyId: property.id,
        principal: principal!.toString(),
        termMonths,
        rateBps,
      }),
    );
    setBusy(false);
    const id =
      outcome?.mode === "simulated"
        ? outcome.response.mortgage.id
        : outcome?.mode === "soroban" && outcome.submitted.returnValue !== undefined
          ? String(outcome.submitted.returnValue)
          : null;
    if (id) router.push(`/mortgages/${id}`);
  }

  return (
    <RequireAccount purpose="apply for a mortgage">
      {loading && profile === undefined ? (
        <Loading label="Checking KYC…" />
      ) : profile?.kycStatus !== "Approved" ? (
        <KycNeeded action="borrow" />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <AmountField
            label="Loan amount"
            value={amount}
            onChange={setAmount}
            max={cap}
            maxLabel="80%"
            hint={`Up to ${formatUsdc(cap)}: 80% of the ${formatUsdc(valuation)} valuation.`}
          />
          {principalError && <p className="-mt-2 text-xs text-rose-300">{principalError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Term (months)" error={termError}>
              {(id) => (
                <>
                  <TextInput
                    id={id}
                    inputMode="numeric"
                    list="apply-terms"
                    value={term}
                    onChange={(e) => setTerm(e.target.value.replace(/\D/g, ""))}
                  />
                  <datalist id="apply-terms">
                    {TERMS.map((t) => (
                      <option key={t} value={t}>
                        {t / 12} years
                      </option>
                    ))}
                  </datalist>
                </>
              )}
            </Field>
            <Field label="Annual rate (%)" error={rateError} hint="The underwriter reviews it. Capped at 30%.">
              {(id) => <TextInput id={id} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />}
            </Field>
          </div>

          {projection && (
            <div className="space-y-2 rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm">
              <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">If fully drawn</p>
              <div className="flex justify-between">
                <span className="text-slate-400">First instalment</span>
                <span className="font-semibold text-white">{formatUsdc(projection.firstPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last instalment</span>
                <span className="font-semibold text-white">{formatUsdc(projection.lastPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total interest</span>
                <span className="font-semibold text-white">{formatUsdc(projection.totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Per stage (×5)</span>
                <span className="font-semibold text-white">{formatUsdc(trancheFor(principal!, 0))}</span>
              </div>
              <p className="pt-1 text-xs leading-relaxed text-slate-500">
                Constant amortisation: each month&apos;s interest on the drawn balance plus a fixed slice of principal.
                Interest is only charged on what has been released, so real payments start lower.
              </p>
            </div>
          )}

          <Button type="submit" block busy={busy} disabled={!valid}>
            Apply for this mortgage
          </Button>
          <p className="text-xs leading-relaxed text-slate-500">
            Applying commits nothing. An underwriter approves or declines; on approval the whole facility is reserved
            in the lending pool, and tranches are paid to the trustee as each stage is signed off.
          </p>
        </form>
      )}
    </RequireAccount>
  );
}
