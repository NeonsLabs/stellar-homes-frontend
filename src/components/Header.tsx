import React from "react";

interface HeaderProps {
  accounts: { address: string; name: string; role: string; balance: number }[];
  currentAccountIdx: number;
  setCurrentAccountIdx: (idx: number) => void;
  reserves: number;
}

export const Header: React.FC<HeaderProps> = ({
  accounts,
  currentAccountIdx,
  setCurrentAccountIdx,
  reserves,
}) => {
  const currentAccount = accounts[currentAccountIdx];

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                StellarVault
              </span>
              <span className="ml-2 rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                Soroban
              </span>
            </div>
          </div>

          {/* Center Info - Total Reserves */}
          <div className="hidden md:flex items-center gap-2 rounded-lg bg-slate-800/50 px-4 py-2 border border-slate-800">
            <span className="text-xs text-slate-400">Total Treasury Reserves:</span>
            <span className="text-sm font-bold text-slate-100">{reserves.toLocaleString()} XLM</span>
          </div>

          {/* Account Switcher / Wallet Connection */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400">Active Persona</span>
              <select
                value={currentAccountIdx}
                onChange={(e) => setCurrentAccountIdx(Number(e.target.value))}
                className="mt-0.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {accounts.map((acc, index) => (
                  <option key={acc.address} value={index}>
                    {acc.name} ({acc.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-950 px-4 py-2 border border-slate-800 shadow-inner">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {truncateAddress(currentAccount.address)}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-800"></div>
              <span className="text-xs font-bold text-cyan-400 font-mono">
                {currentAccount.balance.toFixed(2)} XLM
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
