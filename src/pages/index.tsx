import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Header } from "../components/Header";
import { TreasurySection } from "../components/TreasurySection";
import { ProposalForm } from "../components/ProposalForm";
import { ProposalList, Proposal } from "../components/ProposalList";
import { RolesConfig } from "../components/RolesConfig";

export default function Home() {
  // ---------------------------------------------------------------------------
  // DEMO STATE SETUP
  // ---------------------------------------------------------------------------

  // Simulated Accounts
  const [accounts, setAccounts] = useState([
    {
      address: "GB7R7U3AN4V6TPAZ7X3O5FHEPA4X3KJH24B5XWEXM6X3OZZZZZZZZZZZ",
      name: "Admin Persona",
      role: "System Admin",
      balance: 5000, // Wallet balance outside treasury
    },
    {
      address: "GD4SR22BJLOH5G55YQYQW4Z7P2F2GZ5W6V4B7XWEXM6X3OYYYYYYYYYY",
      name: "Co-Signer A",
      role: "Co-Signer",
      balance: 5000,
    },
    {
      address: "GC8PK55CJLOH5G55YQYQW4Z7P2F2GZ5W6V4B7XWEXM6X3OXXXXXXXXXX",
      name: "Co-Signer B",
      role: "Co-Signer",
      balance: 5000,
    },
    {
      address: "GAAA333BJLOH5G55YQYQW4Z7P2F2GZ5W6V4B7XWEXM6X3OWWWWWWWWWW",
      name: "Visitor Persona",
      role: "Visitor",
      balance: 2500,
    },
  ]);

  const [currentAccountIdx, setCurrentAccountIdx] = useState(0);
  const activeAccount = accounts[currentAccountIdx];

  // System Parameters
  const [quorum, setQuorum] = useState(2);
  const [executionDelay, setExecutionDelay] = useState(300); // 5 minutes in seconds
  const [proposalFee, setProposalFee] = useState(10);
  const [signers, setSigners] = useState([
    "GD4SR22BJLOH5G55YQYQW4Z7P2F2GZ5W6V4B7XWEXM6X3OYYYYYYYYYY",
    "GC8PK55CJLOH5G55YQYQW4Z7P2F2GZ5W6V4B7XWEXM6X3OXXXXXXXXXX",
  ]);

  // Treasury Capital
  const [totalReserves, setTotalReserves] = useState(50000);
  const [balances, setBalances] = useState<{ [address: string]: number }>({
    "GB7R7U3AN4V6TPAZ7X3O5FHEPA4X3KJH24B5XWEXM6X3OZZZZZZZZZZZ": 10000,
    "GD4SR22BJLOH5G55YQYQW4Z7P2F2GZ5W6V4B7XWEXM6X3OYYYYYYYYYY": 15000,
    "GC8PK55CJLOH5G55YQYQW4Z7P2F2GZ5W6V4B7XWEXM6X3OXXXXXXXXXX": 15000,
    "GAAA333BJLOH5G55YQYQW4Z7P2F2GZ5W6V4B7XWEXM6X3OWWWWWWWWWW": 10000,
  });

  // Proposals Registry
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalCounter, setProposalCounter] = useState(0);

  // Simulated Time (Unix Timestamp in seconds)
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  // ---------------------------------------------------------------------------
  // TIMERS / LOOP
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ---------------------------------------------------------------------------
  // PERMISSIONS CHECK
  // ---------------------------------------------------------------------------
  const isAdmin = activeAccount.role === "System Admin";
  const isSigner = signers.includes(activeAccount.address);

  // ---------------------------------------------------------------------------
  // TREASURY HANDLERS
  // ---------------------------------------------------------------------------
  const handleDeposit = (amount: number) => {
    // Deduct from wallet balance
    const updatedAccounts = [...accounts];
    updatedAccounts[currentAccountIdx].balance -= amount;
    setAccounts(updatedAccounts);

    // Add to contract balance
    const addr = activeAccount.address;
    setBalances((prev) => ({
      ...prev,
      [addr]: (prev[addr] || 0) + amount,
    }));

    // Add to total reserves
    setTotalReserves((prev) => prev + amount);
  };

  const handleWithdraw = (amount: number) => {
    // Add to wallet balance
    const updatedAccounts = [...accounts];
    updatedAccounts[currentAccountIdx].balance += amount;
    setAccounts(updatedAccounts);

    // Subtract from contract balance
    const addr = activeAccount.address;
    setBalances((prev) => ({
      ...prev,
      [addr]: Math.max(0, (prev[addr] || 0) - amount),
    }));

    // Subtract from total reserves
    setTotalReserves((prev) => Math.max(0, prev - amount));
  };

  // ---------------------------------------------------------------------------
  // PROPOSAL HANDLERS
  // ---------------------------------------------------------------------------
  const handleCreateProposal = (recipient: string, amount: number) => {
    // Proposer must pay the proposal fee
    const updatedBalances = { ...balances };
    const proposerAddr = activeAccount.address;
    updatedBalances[proposerAddr] = Math.max(0, (updatedBalances[proposerAddr] || 0) - proposalFee);
    setBalances(updatedBalances);

    // The fee is added to total reserves (or stays in reserves)
    // Create proposal object
    const newId = proposalCounter + 1;
    const newProposal: Proposal = {
      id: newId,
      proposer: proposerAddr,
      recipient,
      amount,
      confirmations: [proposerAddr], // Proposer auto-confirms
      state: "PENDING",
      created_at: currentTime,
      delay_until: 0, // Set when quorum is reached
    };

    // If quorum is 1, it auto-confirms immediately
    if (quorum === 1) {
      newProposal.state = "CONFIRMED";
      newProposal.delay_until = currentTime + executionDelay;
    }

    setProposals((prev) => [newProposal, ...prev]);
    setProposalCounter(newId);
  };

  const handleConfirmProposal = (proposalId: number) => {
    setProposals((prev) =>
      prev.map((prop) => {
        if (prop.id !== proposalId) return prop;

        // Check if already confirmed
        if (prop.confirmations.includes(activeAccount.address)) return prop;

        const updatedConfirmations = [...prop.confirmations, activeAccount.address];
        const quorumReached = updatedConfirmations.length >= quorum;

        return {
          ...prop,
          confirmations: updatedConfirmations,
          state: quorumReached ? "CONFIRMED" : prop.state,
          delay_until: quorumReached ? currentTime + executionDelay : prop.delay_until,
        };
      })
    );
  };

  const handleExecuteProposal = (proposalId: number) => {
    const propIndex = proposals.findIndex((p) => p.id === proposalId);
    if (propIndex === -1) return;

    const prop = proposals[propIndex];
    if (prop.state !== "CONFIRMED") return;
    if (currentTime < prop.delay_until) return;

    // Deduct from total reserves
    setTotalReserves((prev) => Math.max(0, prev - prop.amount));

    // Add to recipient's deposited balance (simulate smart contract wallet release)
    setBalances((prev) => ({
      ...prev,
      [prop.recipient]: (prev[prop.recipient] || 0) + prop.amount,
    }));

    // Update proposal state
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, state: "EXECUTED" } : p))
    );
  };

  const handleCancelProposal = (proposalId: number) => {
    const propIndex = proposals.findIndex((p) => p.id === proposalId);
    if (propIndex === -1) return;

    const prop = proposals[propIndex];
    if (prop.state !== "CONFIRMED") return;
    if (currentTime < prop.delay_until) return;

    // Refund proposal fee to proposer
    setBalances((prev) => ({
      ...prev,
      [prop.proposer]: (prev[prop.proposer] || 0) + proposalFee,
    }));

    // Update proposal state
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, state: "CANCELLED" } : p))
    );
  };

  const handleFastForward = (proposalId: number) => {
    // Simulate skip of execution delay by bringing delay_until to current time
    setProposals((prev) =>
      prev.map((prop) =>
        prop.id === proposalId ? { ...prop, delay_until: currentTime } : prop
      )
    );
  };

  // ---------------------------------------------------------------------------
  // SYSTEM CONFIG HANDLERS
  // ---------------------------------------------------------------------------
  const handleUpdateQuorum = (newQuorum: number) => {
    setQuorum(newQuorum);
  };

  const handleUpdateDelay = (newDelaySeconds: number) => {
    setExecutionDelay(newDelaySeconds);
  };

  const handleUpdateFee = (newFee: number) => {
    setProposalFee(newFee);
  };

  const handleAddSigner = (signerAddress: string) => {
    setSigners((prev) => [...prev, signerAddress]);
  };

  const handleRemoveSigner = (signerAddress: string) => {
    const updated = signers.filter((s) => s !== signerAddress);
    setSigners(updated);
    // Adjust quorum if quorum exceeds total signers after removal
    if (quorum > updated.length) {
      setQuorum(Math.max(1, updated.length));
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      <Head>
        <title>StellarVault — Multi-Signature Treasury Dashboard</title>
        <meta
          name="description"
          content="Decentralized multi-signature treasury and governance control on Stellar using Soroban smart contracts."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header
        accounts={accounts}
        currentAccountIdx={currentAccountIdx}
        setCurrentAccountIdx={setCurrentAccountIdx}
        reserves={totalReserves}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Banner Alert for Sandbox Mode */}
        <div className="flex flex-col gap-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between shadow-lg shadow-cyan-500/5">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-cyan-400">Soroban Contract Sandbox Mode</h2>
            <p className="text-xs text-slate-400">
              Interactive sandbox simulating local deployment of StellarVault contracts. Switch roles to see RBAC logic in action.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
              Ready for Testnet
            </span>
          </div>
        </div>

        {/* Treasury metrics & deposit/withdrawal operations */}
        <TreasurySection
          totalReserves={totalReserves}
          personalBalance={balances[activeAccount.address] || 0}
          walletBalance={activeAccount.balance}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
        />

        {/* Proposals Dashboard & Form */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Proposal List Section */}
          <div className="lg:col-span-2 space-y-6">
            <ProposalList
              proposals={proposals}
              onConfirm={handleConfirmProposal}
              onExecute={handleExecuteProposal}
              onCancel={handleCancelProposal}
              onFastForward={handleFastForward}
              quorum={quorum}
              currentSignerAddress={activeAccount.address}
              isSigner={isSigner}
              currentTime={currentTime}
            />
          </div>

          {/* New Proposal creation Form */}
          <div className="space-y-6">
            <ProposalForm
              onCreateProposal={handleCreateProposal}
              proposalFee={proposalFee}
              isSigner={isSigner}
              signerAddress={activeAccount.address}
              userBalance={balances[activeAccount.address] || 0}
            />
          </div>
        </div>

        {/* Configurations Section */}
        <RolesConfig
          quorum={quorum}
          executionDelay={executionDelay}
          proposalFee={proposalFee}
          signers={signers}
          isAdmin={isAdmin}
          onUpdateQuorum={handleUpdateQuorum}
          onUpdateDelay={handleUpdateDelay}
          onUpdateFee={handleUpdateFee}
          onAddSigner={handleAddSigner}
          onRemoveSigner={handleRemoveSigner}
        />
      </main>

      {/* footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600">
        <p>© 2026 StellarVault Project. Built on Stellar Soroban Smart Contracts.</p>
      </footer>
    </div>
  );
}
