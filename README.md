# 🏠 StellarHomes Frontend

> Diaspora mortgages for building back home, released against the building and settled by Soroban smart contracts on Stellar.

This is the web app for the StellarHomes platform. It talks to [`stellar-homes-backend`](../stellar-homes-backend), which in turn runs the three contracts in [`stellar-homes-contract`](../stellar-homes-contract):

| Contract | What the app does with it |
|----------|---------------------------|
| **PropertyRegistry** | Register properties, verify titles, publish valuations, submit and sign off the five construction stages |
| **LendingPool** | Deposit, withdraw uncommitted capital, claim interest |
| **MortgagePool** | Apply, approve or decline, release tranches, repay, write off |

The contract is the source of truth for what is owed. The app never re-implements loan state: it reads live balances from the backend, and its only arithmetic is a projection that uses the contract's own integer maths (constant amortisation, not an annuity).

---

## Pages

| Route | Who | What |
|-------|-----|------|
| `/` | Everyone | Overview, live pool figures, and a calculator using the contract's arithmetic |
| `/properties`, `/properties/:id` | Everyone | Registry, build schedule, title and valuation. Borrowers apply here; trustees submit evidence; oracles verify, value and sign off |
| `/mortgages/:id` | Everyone | Live balance, tranches, projected schedule, payments. Borrowers repay; underwriters decide; anyone releases a signed-off tranche or writes off a loan past its grace period |
| `/dashboard` | Borrower | Your loans |
| `/invest` | Investor | Pool breakdown, your position, deposit, withdraw and claim |
| `/trustee` | Trustee | Register properties and track their builds |
| `/oracle` | Oracle | Queue of titles, valuations and stages waiting for you |
| `/underwriter` | Underwriter | Applications and live loans |
| `/kyc` | Everyone | Off-chain identity check, required to borrow or invest |
| `/admin` | Admin | Grant and revoke roles, move the simulated ledger's clock, audit log |
| `/ledger` | Everyone | Contract addresses, rules read from the chain, contract events |
| `/learn` | Everyone | How the product works |

## Accounts and signing

The backend runs in one of two modes, and the app adapts to whichever `/stats` reports:

- **Simulated ledger** (no contract ids configured). The backend verifies no signatures, so the account menu can generate *local* demo accounts, one per role. This lets you walk the whole lifecycle from one browser. Admin calls use the backend's `ADMIN_API_KEY`, entered on `/admin`.
- **Soroban** (deployed contracts). Every write comes back as an unsigned transaction. The app signs it with [Freighter](https://www.freighter.app/) as the account the backend names, then relays it through `POST /api/tx/submit`. Only Freighter accounts can act in this mode.

Title deeds, surveys and site evidence are hashed with SHA-256 in the browser. Only the digest is sent; the files never leave the device.

## Conventions

- Amounts are integers in USDC's smallest unit (7 decimals). They are kept as `bigint` end to end and formatted only for display (`src/lib/format.ts`).
- Times shown against "now" use the ledger time from `/stats`, which runs ahead of the wall clock after simulated time travel.
- On deployed contracts the MortgagePool has no listing getter, so live loans are found through their properties (`src/lib/scan.ts`). Paid-off and defaulted loans are opened by id.

## Getting started

Start the backend first. For local development, use the simulated ledger:

```bash
cd ../stellar-homes-backend
npm install
ADMIN_API_KEY=dev-key ALLOW_TIME_TRAVEL=true npm run dev   # http://localhost:4000
```

Then the app:

```bash
npm install
npm run dev        # http://localhost:3000
```

The app looks for the backend at `http://localhost:4000`. To point it elsewhere, set `NEXT_PUBLIC_API_URL` in `.env.local`.

### Walking the lifecycle on the simulated ledger

1. **Connect**: generate Borrower, Investor, Trustee, Oracle and Underwriter accounts.
2. **/admin**: enter the admin key, then grant trustee, oracle and underwriter to those accounts.
3. **/kyc**: verify the borrower and the investor.
4. **/invest**: deposit as the investor.
5. **/trustee**: register a property.
6. **/oracle**: verify its title, then value it from the property page.
7. **Property page**: apply as the borrower, for up to 80% of the valuation.
8. **Mortgage page**: approve as the underwriter.
9. **Property page**: submit foundation evidence as the trustee, then sign it off as the oracle. Release the tranche.
10. **/admin**: move the clock forward 30 days, then repay as the borrower.

## Scripts

```bash
npm run dev      # development server
npm run build    # production build (also type-checks)
npm run start    # serve the production build
npm run lint
```

## Project structure

```
src/
├── app/                  # Routes; each page.tsx sets metadata and renders a view
├── components/
│   ├── providers/        # AppProvider: ledger info, accounts, notices, write/sign flow
│   ├── layout/           # Header, account menu, footer, ledger banner, notices
│   ├── property/         # Registry list and detail, apply form, milestone track
│   ├── mortgage/         # Mortgage detail, schedule, dashboard
│   ├── invest/           # Lending pool
│   ├── roles/            # Trustee, oracle, underwriter, KYC, admin
│   ├── home/             # Landing calculator and live stats
│   └── ui/               # Panels, badges, fields, buttons, modal, states
└── lib/
    ├── api.ts            # Typed client for every backend endpoint
    ├── amortization.ts   # The MortgagePool's arithmetic, for projections
    ├── format.ts         # Base units ↔ USDC, dates, durations
    ├── errors.ts         # Contract and backend errors in plain language
    ├── accounts.ts       # Accounts kept in localStorage
    ├── scan.ts           # Finding live loans without a listing getter
    ├── hash.ts           # SHA-256 of documents, in the browser
    └── useApi.ts, hooks.ts
```

## Keeping in step with the backend

`src/lib/api.ts` mirrors the backend's `src/present.ts` and route files, and `src/lib/errors.ts` mirrors the error names in its `src/chain/spec.ts`. When either changes, update these two files, then run `npm run build`.
