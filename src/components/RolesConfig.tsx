import React, { useState } from "react";

interface RolesConfigProps {
  quorum: number;
  executionDelay: number;
  proposalFee: number;
  signers: string[];
  isAdmin: boolean;
  onUpdateQuorum: (newQuorum: number) => void;
  onUpdateDelay: (newDelaySeconds: number) => void;
  onUpdateFee: (newFee: number) => void;
  onAddSigner: (signerAddress: string) => void;
  onRemoveSigner: (signerAddress: string) => void;
}

export const RolesConfig: React.FC<RolesConfigProps> = ({
  quorum,
  executionDelay,
  proposalFee,
  signers,
  isAdmin,
  onUpdateQuorum,
  onUpdateDelay,
  onUpdateFee,
  onAddSigner,
  onRemoveSigner,
}) => {
  const [newQuorumInput, setNewQuorumInput] = useState("");
  const [newDelayInput, setNewDelayInput] = useState("");
  const [newFeeInput, setNewFeeInput] = useState("");
  const [newSignerInput, setNewSignerInput] = useState("");

  const [quorumError, setQuorumError] = useState("");
  const [delayError, setDelayError] = useState("");
  const [feeError, setFeeError] = useState("");
  const [signerError, setSignerError] = useState("");

  const handleQuorumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuorumError("");
    const val = parseInt(newQuorumInput);
    if (isNaN(val) || val <= 0) {
      setQuorumError("Quorum must be a positive integer.");
      return;
    }
    if (val > signers.length) {
      setQuorumError(`Quorum cannot exceed total signers (${signers.length}).`);
      return;
    }
    onUpdateQuorum(val);
    setNewQuorumInput("");
  };

  const handleDelaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDelayError("");
    const val = parseInt(newDelayInput);
    if (isNaN(val) || val < 0) {
      setDelayError("Delay must be a positive integer.");
      return;
    }
    if (val > 2592000) {
      // 30 days
      setDelayError("Delay cannot exceed 30 days (2,592,000 seconds).");
      return;
    }
    onUpdateDelay(val);
    setNewDelayInput("");
  };

  const handleFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeeError("");
    const val = parseFloat(newFeeInput);
    if (isNaN(val) || val < 0) {
      setFeeError("Fee must be a positive number.");
      return;
    }
    onUpdateFee(val);
    setNewFeeInput("");
  };

  const handleAddSignerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignerError("");
    const input = newSignerInput.trim();
    if (!input) {
      setSignerError("Signer address is required.");
      return;
    }
    if (!input.startsWith("G") || input.length !== 56) {
      setSignerError("Must be a valid Stellar public address (starts with G, 56 characters).");
      return;
    }
    if (signers.includes(input)) {
      setSignerError("Address is already a co-signer.");
      return;
    }
    onAddSigner(input);
    setNewSignerInput("");
  };

  const formatDelay = (seconds: number) => {
    if (seconds === 0) return "0s (Instant)";
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">System Settings</h2>
        <p className="text-xs text-slate-400">Configure parameters for authorization, delays, and signers.</p>
      </div>

      {/* Admin Panel Warning */}
      {!isAdmin && (
        <div className="rounded-lg bg-slate-800/60 border border-slate-800 p-3 text-xs text-slate-400">
          🔒 Read-only view. Switching to the **Admin** persona allows changing these parameters.
        </div>
      )}

      {/* Configuration Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-800 pb-6">
        {/* Quorum Configuration */}
        <form onSubmit={handleQuorumSubmit} className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-400">Quorum Requirement</span>
            <span className="font-mono text-cyan-400 font-bold">{quorum} Signatures</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="New quorum"
              value={newQuorumInput}
              disabled={!isAdmin}
              onChange={(e) => setNewQuorumInput(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isAdmin}
              className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-50"
            >
              Update
            </button>
          </div>
          {quorumError && <p className="text-[10px] text-rose-400">{quorumError}</p>}
        </form>

        {/* Delay Configuration */}
        <form onSubmit={handleDelaySubmit} className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-400">Execution Delay</span>
            <span className="font-mono text-cyan-400 font-bold">{formatDelay(executionDelay)}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Delay in seconds"
              value={newDelayInput}
              disabled={!isAdmin}
              onChange={(e) => setNewDelayInput(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isAdmin}
              className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-50"
            >
              Update
            </button>
          </div>
          {delayError && <p className="text-[10px] text-rose-400">{delayError}</p>}
        </form>

        {/* Fee Configuration */}
        <form onSubmit={handleFeeSubmit} className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-400">Proposal Fee</span>
            <span className="font-mono text-cyan-400 font-bold">{proposalFee} XLM</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              placeholder="Fee amount"
              value={newFeeInput}
              disabled={!isAdmin}
              onChange={(e) => setNewFeeInput(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isAdmin}
              className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-50"
            >
              Update
            </button>
          </div>
          {feeError && <p className="text-[10px] text-rose-400">{feeError}</p>}
        </form>
      </div>

      {/* Signers Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">Co-Signer Registry ({signers.length})</h3>
          <span className="text-xxs text-slate-500">Signers who have transaction verification access</span>
        </div>

        {/* Add Cosigner Form */}
        {isAdmin && (
          <form onSubmit={handleAddSignerSubmit} className="space-y-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <label className="block text-xs font-semibold text-slate-400">Register New Co-Signer</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="G..."
                value={newSignerInput}
                onChange={(e) => setNewSignerInput(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:from-cyan-400 hover:to-blue-500 whitespace-nowrap"
              >
                Add Signer
              </button>
            </div>
            {signerError && <p className="text-[10px] text-rose-400">{signerError}</p>}
          </form>
        )}

        {/* Signers list */}
        <div className="space-y-2">
          {signers.map((signer) => (
            <div
              key={signer}
              className="flex items-center justify-between rounded-lg bg-slate-950 p-3 border border-slate-900 hover:border-slate-800"
            >
              <span className="font-mono text-xs text-slate-300">{signer}</span>
              {isAdmin && signers.length > 1 && (
                <button
                  onClick={() => onRemoveSigner(signer)}
                  className="text-xxs font-bold text-rose-400 hover:text-rose-300 px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded hover:bg-rose-500/20 transition"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
