# StellarHomes: Real-Estate Trust Escrows and Mortgage Marketplace

StellarHomes is a decentralized home construction and mortgage financing platform that connects Sub-Saharan African property developers with international diaspora investors. 

Built using the **Stellar Network** and **Soroban Smart Contracts**, the platform ensures full transparency, safety, and regulatory compliance at every level of the real estate financing cycle.

---

## Key Platform Portals & Features

1. **Marketplace Portal (`/properties`)**
   - Interactive search and region filtering (LTV limits, locations).
   - Dynamic property details modal including verification certificates from Ministry of Lands oracles.
   - Live on-chain survey deed hash mapping.

2. **Investor Portal (`/invest`)**
   - Supply USDC liquidity pool simulator.
   - Yield calculators with real-time yield rate curves and historical TVL/yield performance charts.
   - Stellar payment transaction simulation.

3. **Trustee & Builder Portal (`/trustee`)**
   - Construction milestone evidence tracker.
   - Escrow release tranche timeline displaying locked, pending, and released funds.
   - Interactive photo & audit report upload simulations.

4. **Learn Portal (`/learn`)**
   - Interactive educational mortgage repayment calculator.
   - Explanation cards detailing Stellar native compliance features: `AUTH_REQUIRED`, `CLAWBACK_ENABLED`, and `Soroban Escrows`.

5. **KYC Compliance Portal (`/kyc`)**
   - Government bio-data and proof of residency verification document upload forms.
   - Stellar wallet integration and on-chain identity credentials cryptographic signing simulation.

6. **Ledger Explorer (`/contracts`)**
   - Live transaction event log feed.
   - Event filter capsules (Oracle, Compliance, Liquidity, Repayment).
   - On-chain transaction hashes.

---

## Technical Stack & Configuration

- **Framework**: Next.js (App Router structure under `src/app/`).
- **Styling**: Tailwind CSS v4 featuring premium dark-mode aesthetics, custom glassmorphism panels, and interactive transition glow effects.
- **Type Safety**: Strictly checked TypeScript project compiler passing eslint parameters.

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run dev server**:
   ```bash
   npm run dev
   ```

3. **Build optimized production bundle**:
   ```bash
   npm run build
   ```
