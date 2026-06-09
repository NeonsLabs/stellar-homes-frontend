import React, { useState } from "react";

interface TreasurySectionProps {
  totalReserves: number;
  personalBalance: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  walletBalance: number;
}

export const TreasurySection: React.FC<TreasurySectionProps> = ({
  totalReserves,
  personalBalance,
  onDeposit,
  onWithdraw,
  walletBalance,
}) => {
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [depositError, setDepositError] = useState<string>("");
  const [withdrawError, setWithdrawError] = useState<string>("");

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError("");
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) {
      setDepositError("Please enter a valid positive number.");
      return;
    }
    if (val > walletBalance) {
      setDepositError("Insufficient funds in mock wallet.");
      return;
    }
    onDeposit(val);
    setDepositAmount("");
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) {
      setWithdrawError("Please enter a valid positive number.");
      return;
    }
    if (val > personalBalance) {
      setWithdrawError("Cannot withdraw more than your deposited balance.");
      return;
    }
    onWithdraw(val);
    setWithdrawAmount("");
  };

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Metrics Card 1 - Total Reserves */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl"></div>
        <p className="text-sm font-medium text-slate-400">Total Treasury Reserves</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-white font-mono">
            {totalReserves.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-cyan-400">XLM</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Aggregated capital locked in the contract available for approved proposals.
        </p>
      </div>

      {/* Metrics Card 2 - Personal Deposited Balance */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl"></div>
        <p className="text-sm font-medium text-slate-400">Your Deposited Balance</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-white font-mono">
            {personalBalance.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-blue-400">XLM</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Your individual deposit within the vault. Can be withdrawn by you at any time.
        </p>
      </div>

      {/* Vault Actions (Deposit / Withdraw Forms) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-300">Vault Operations</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {/* Deposit Form */}
          <form onSubmit={handleDepositSubmit} className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">Deposit to Treasury</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="any"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm font-mono text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs font-semibold text-slate-500">XLM</span>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:from-cyan-400 hover:to-blue-500 focus:outline-none"
              >
                Deposit
              </button>
            </div>
            {depositError && <p className="text-xxs text-rose-400">{depositError}</p>}
          </form>

          {/* Withdraw Form */}
          <form onSubmit={handleWithdrawSubmit} className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">Withdraw from Vault</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="any"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm font-mono text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs font-semibold text-slate-500">XLM</span>
              </div>
              <button
                type="submit"
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none"
              >
                Withdraw
              </button>
            </div>
            {withdrawError && <p className="text-xxs text-rose-400">{withdrawError}</p>}
          </form>
        </div>
      </div>
    </section>
  );
};
