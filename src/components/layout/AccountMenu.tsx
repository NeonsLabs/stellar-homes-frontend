"use client";

import React, { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import Button from "@/components/ui/Button";
import Field, { TextInput } from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import { truncateHash } from "@/lib/format";
import { looksLikeAddress } from "@/lib/hash";

const DEMO_LABELS = ["Borrower", "Investor", "Trustee", "Oracle", "Underwriter"];

async function randomAddress(): Promise<string> {
  const { Keypair } = await import("@stellar/stellar-sdk");
  // Only the public key is kept: the simulated ledger verifies no signatures,
  // and nothing here ever signs with a local account.
  return Keypair.random().publicKey();
}

/** Header button and dialog for choosing which account the app acts as. */
export default function AccountMenu() {
  const { accounts, account, selectAccount, addAccount, forgetAccount, connectFreighter, stats, notify } = useApp();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("Borrower");
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);

  const simulated = stats?.ledger !== "soroban";

  async function createDemo() {
    setBusy(true);
    try {
      const taken = accounts.filter((a) => a.label.startsWith(label)).length;
      addAccount({
        address: await randomAddress(),
        label: taken ? `${label} ${taken + 1}` : label,
        source: "local",
      });
    } catch {
      notify("error", "Could not generate an address");
    } finally {
      setBusy(false);
    }
  }

  function addManual(e: React.FormEvent) {
    e.preventDefault();
    const address = manual.trim();
    if (!looksLikeAddress(address)) return;
    addAccount({ address, label, source: "local" });
    setManual("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
          account
            ? "border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            : "bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:shadow-lg hover:shadow-sky-500/25"
        }`}
      >
        {account ? (
          <>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="hidden sm:inline">{account.label}</span>
            <span className="font-mono text-xs text-slate-400">{truncateHash(account.address, 4, 4)}</span>
          </>
        ) : (
          "Connect"
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} labelledBy="account-menu-title" size="md">
        <div className="space-y-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="account-menu-title" className="text-lg font-bold text-white">
                Accounts
              </h2>
              <p className="mt-1 text-sm text-slate-400">Pick the wallet the app acts as.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {accounts.length > 0 && (
            <ul className="space-y-2">
              {accounts.map((a) => {
                const active = a.address === account?.address;
                const unusable = !simulated && a.source !== "freighter";
                return (
                  <li
                    key={a.address}
                    className={`flex items-center gap-3 rounded-2xl border p-3 ${
                      active ? "border-sky-500/40 bg-sky-500/10" : "border-white/5 bg-white/[0.03]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectAccount(a.address)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-white">
                        {a.label}
                        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 uppercase">
                          {a.source === "freighter" ? "Freighter" : "Local"}
                        </span>
                        {active && <span className="text-[10px] font-bold text-sky-300 uppercase">Active</span>}
                      </span>
                      <span className="block truncate font-mono text-xs text-slate-400">{a.address}</span>
                      {unusable && (
                        <span className="text-[11px] text-amber-300">
                          Cannot sign for deployed contracts. Use Freighter.
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => forgetAccount(a.address)}
                      className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-white/5 hover:text-rose-300"
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="space-y-3">
            <Button block onClick={connectFreighter}>
              Connect Freighter
            </Button>
            {!simulated && (
              <p className="text-xs leading-relaxed text-slate-500">
                The backend is using deployed contracts, so every transaction is signed in Freighter.
              </p>
            )}
          </div>

          {simulated && (
            <div className="space-y-4 border-t border-white/5 pt-5">
              <div>
                <h3 className="text-sm font-bold text-white">Demo accounts</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  The backend is running the simulated ledger, which checks no signatures. Create one account per
                  role to walk the whole lifecycle. An oracle can never verify a property it holds in trust.
                </p>
              </div>
              <Field label="Label">
                {(id) => (
                  <div className="flex gap-2">
                    <TextInput id={id} list="demo-labels" value={label} onChange={(e) => setLabel(e.target.value)} />
                    <datalist id="demo-labels">
                      {DEMO_LABELS.map((l) => (
                        <option key={l} value={l} />
                      ))}
                    </datalist>
                    <Button variant="secondary" onClick={createDemo} busy={busy} disabled={!label.trim()}>
                      Generate
                    </Button>
                  </div>
                )}
              </Field>
              <form onSubmit={addManual}>
                <Field
                  label="Or use an existing address"
                  error={manual && !looksLikeAddress(manual) ? "A Stellar address is 56 characters starting with G." : undefined}
                >
                  {(id) => (
                    <div className="flex gap-2">
                      <TextInput
                        id={id}
                        className="font-mono"
                        placeholder="G…"
                        value={manual}
                        onChange={(e) => setManual(e.target.value)}
                      />
                      <Button type="submit" variant="secondary" disabled={!looksLikeAddress(manual) || !label.trim()}>
                        Add
                      </Button>
                    </div>
                  )}
                </Field>
              </form>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
