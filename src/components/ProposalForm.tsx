import React, { useState } from "react";

interface ProposalFormProps {
  onCreateProposal: (recipient: string, amount: number) => void;
  proposalFee: number;
  isSigner: boolean;
  signerAddress: string;
  userBalance: number;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({
  onCreateProposal,
  proposalFee,
  isSigner,
  signerAddress,
  userBalance,
}) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!isSigner) {
      setError("Only addresses with the Co-Signer role can submit proposals.");
      return;
    }

    if (!recipient.trim()) {
      setError("Recipient address is required.");
      return;
    }

    if (!recipient.startsWith("G") || recipient.length !== 56) {
      setError("Recipient must be a valid Stellar public address (starts with G, 56 characters).");
      return;
    }

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    if (userBalance < proposalFee) {
      setError(`Insufficient deposited balance to cover the anti-spam proposal fee (${proposalFee} XLM).`);
      return;
    }

    onCreateProposal(recipient.trim(), val);
    setRecipient("");
    setAmount("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white">New Transaction Proposal</h2>
          <p className="text-xs text-slate-400">Propose a fund transfer from the multi-sig treasury.</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Anti-Spam Fee</span>
          <span className="text-sm font-bold text-cyan-400 font-mono">{proposalFee} XLM</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400">Recipient Public Key</label>
          <input
            type="text"
            placeholder="e.g. GAAA234...ZZZZ"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm font-mono text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400">Amount (XLM)</label>
          <div className="relative mt-1.5">
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm font-mono text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-500">XLM</span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
            ✓ Proposal created successfully! Fee of {proposalFee} XLM deducted from your vault balance.
          </div>
        )}

        <button
          type="submit"
          disabled={!isSigner}
          className={`w-full rounded-lg py-2.5 text-sm font-bold text-white shadow-lg transition-all ${
            isSigner
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 cursor-pointer shadow-cyan-500/10"
              : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
          }`}
        >
          {isSigner ? "Submit Proposal" : "Signer Permissions Required"}
        </button>
      </form>
    </div>
  );
};
