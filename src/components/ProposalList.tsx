import React from "react";

export interface Proposal {
  id: number;
  proposer: string;
  recipient: string;
  amount: number;
  confirmations: string[]; // List of signer addresses
  state: "PENDING" | "CONFIRMED" | "EXECUTED" | "CANCELLED";
  created_at: number; // timestamp in seconds
  delay_until: number; // timestamp in seconds
}

interface ProposalListProps {
  proposals: Proposal[];
  onConfirm: (proposalId: number) => void;
  onExecute: (proposalId: number) => void;
  onCancel: (proposalId: number) => void;
  onFastForward: (proposalId: number) => void;
  quorum: number;
  currentSignerAddress: string;
  isSigner: boolean;
  currentTime: number; // simulated current time (timestamp in seconds)
}

export const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  onConfirm,
  onExecute,
  onCancel,
  onFastForward,
  quorum,
  currentSignerAddress,
  isSigner,
  currentTime,
}) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getStatusBadge = (state: Proposal["state"]) => {
    switch (state) {
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            Pending Quorum
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
            Confirmed (Timelock)
          </span>
        );
      case "EXECUTED":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            Executed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Active Proposals</h2>
          <p className="text-xs text-slate-400">Track, vote, and execute multi-sig transactions.</p>
        </div>
        <div className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 border border-slate-700">
          Simulated Clock: <span className="font-mono text-cyan-400 font-bold">{mounted ? new Date(currentTime * 1000).toLocaleTimeString() : "--:--:--"}</span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {proposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              className="h-12 w-12 text-slate-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm font-medium text-slate-500">No proposals created yet.</p>
            <p className="text-xs text-slate-600">Create one above to begin the voting cycle.</p>
          </div>
        ) : (
          proposals.map((prop) => {
            const hasConfirmed = prop.confirmations.includes(currentSignerAddress);
            const isQuorumReached = prop.confirmations.length >= quorum;
            const isDelayPassed = currentTime >= prop.delay_until;
            const secondsLeft = prop.delay_until - currentTime;

            return (
              <div
                key={prop.id}
                className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-5 transition-all hover:border-slate-700"
              >
                {/* Accent line on left based on state */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    prop.state === "PENDING"
                      ? "bg-amber-500"
                      : prop.state === "CONFIRMED"
                      ? "bg-blue-500"
                      : prop.state === "EXECUTED"
                      ? "bg-emerald-500"
                      : "bg-rose-500"
                  }`}
                />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left Column: ID, Proposer & Target Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-500">#{prop.id}</span>
                      <h4 className="text-sm font-semibold text-white font-mono">
                        {prop.amount.toLocaleString()} XLM
                      </h4>
                      {getStatusBadge(prop.state)}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-400">
                      <div>
                        Proposer:{" "}
                        <span className="font-mono text-slate-300">
                          {truncateAddress(prop.proposer)}
                        </span>
                      </div>
                      <div>
                        Recipient:{" "}
                        <span className="font-mono text-slate-300">
                          {truncateAddress(prop.recipient)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Quorum progress */}
                  <div className="flex flex-col gap-1 w-full sm:w-44">
                    <div className="flex justify-between text-xxs font-semibold text-slate-400">
                      <span>Signatures:</span>
                      <span className="font-mono">
                        {prop.confirmations.length} / {quorum} Required
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          prop.state === "EXECUTED"
                            ? "bg-emerald-500"
                            : prop.state === "CANCELLED"
                            ? "bg-rose-500"
                            : prop.confirmations.length >= quorum
                            ? "bg-blue-500"
                            : "bg-amber-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (prop.confirmations.length / (quorum || 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Timelock info for Confirmed State */}
                {prop.state === "CONFIRMED" && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-900/50 p-2.5 border border-slate-900 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="relative flex h-2 w-2">
                        {mounted && isDelayPassed ? (
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        ) : (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </>
                        )}
                      </span>
                      {!mounted ? (
                        <span>Timelock: Loading...</span>
                      ) : isDelayPassed ? (
                        <span className="text-emerald-400 font-medium">Timelock expired. Transaction ready!</span>
                      ) : (
                        <span>
                          Timelock: Locked (
                          <span className="font-mono text-amber-400 font-bold">{secondsLeft}s</span> remaining)
                        </span>
                      )}
                    </div>
                    {mounted && !isDelayPassed && (
                      <button
                        onClick={() => onFastForward(prop.id)}
                        className="rounded bg-slate-800 px-2 py-0.5 text-xxs font-bold text-cyan-400 border border-slate-700 hover:bg-slate-700 transition"
                      >
                        ⚡ Skip Delay
                      </button>
                    )}
                  </div>
                )}

                {/* Actions Row */}
                {prop.state !== "EXECUTED" && prop.state !== "CANCELLED" && (
                  <div className="mt-4 flex justify-end gap-2 border-t border-slate-900 pt-3">
                    {/* Approve (Confirm) Button */}
                    {prop.state === "PENDING" && (
                      <button
                        onClick={() => onConfirm(prop.id)}
                        disabled={!isSigner || hasConfirmed}
                        className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                          !isSigner
                            ? "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed"
                            : hasConfirmed
                            ? "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed"
                            : "bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-md shadow-amber-500/5"
                        }`}
                      >
                        {hasConfirmed ? "Confirmed ✓" : "Confirm Signature"}
                      </button>
                    )}

                    {/* Execute Button */}
                    {prop.state === "CONFIRMED" && (
                      <button
                        onClick={() => onExecute(prop.id)}
                        disabled={!mounted || !isDelayPassed}
                        className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                          mounted && isDelayPassed
                            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-md shadow-emerald-500/5"
                            : "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed"
                        }`}
                      >
                        Execute Payout
                      </button>
                    )}

                    {/* Cancel Button */}
                    {prop.state === "CONFIRMED" && (
                      <button
                        onClick={() => onCancel(prop.id)}
                        disabled={!mounted || !isDelayPassed}
                        className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                          mounted && isDelayPassed
                            ? "bg-slate-900 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                            : "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed"
                        }`}
                      >
                        Cancel Proposal
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
