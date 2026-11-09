# Contributing to stellar-homes-frontend

This is the web app for StellarHomes, built with Next.js, TypeScript and
Tailwind. Every write is signed in the user's Freighter wallet. The app never
re-implements loan state: it reads balances from the backend, and its only
arithmetic is a repayment projection that uses the contract's own integer maths.

## Getting set up

You need Node 22 and npm. You do not need a chain or a funded wallet: the
backend has a simulated ledger that behaves like the contracts, and the app can
generate test accounts for you.

Start the backend first, in a sibling folder:

```bash
git clone https://github.com/NeonsLabs/stellar-homes-backend
cd stellar-homes-backend
npm install
ADMIN_API_KEY=dev-key ALLOW_TIME_TRAVEL=true npm run dev   # http://localhost:4000
```

Then the app:

```bash
git clone https://github.com/<you>/stellar-homes-frontend
cd stellar-homes-frontend
npm install
npm run dev   # http://localhost:3000
```

The app looks for the backend at `http://localhost:4000`. To point it elsewhere,
set `NEXT_PUBLIC_API_URL` in `.env.local`. The README has a step by step walk
through a whole mortgage on the simulated ledger, which is the quickest way to
see every page working.

## Picking something to work on

1. Browse the [open issues](https://github.com/NeonsLabs/stellar-homes-frontend/issues).
2. Comment on the one you want so two people don't build the same thing.
3. Fork the repo and branch from `main`, for example `feat/mortgage-filters`.

## Before you open a PR

```bash
npm run lint
npm test
npm run build
```

CI runs exactly these three. If they pass locally, CI should agree.

Tests use [Vitest](https://vitest.dev) and live in `test/`. They cover the money
formatting and the loan projection, which must agree with the contract to the
last unit. There are no component or browser tests yet, so for a UI change also
check it by hand in light and dark mode and say in the PR what you tried. Adding
component tests is a welcome contribution.

## Writing the code

- **Pages stay thin.** Each `page.tsx` sets metadata and renders a view. Put the
  logic in `src/components` or `src/lib`.
- **Money is an integer in the token's smallest unit** (7 decimals for USDC).
  Format it for display only at the last step. Never use floats for amounts.
- **Never trust the screen for authority.** The contract decides who may do what.
  The UI only decides what to show.
- **Handle the wallet being absent, locked or on the wrong network.** Show a
  message that says what the user can do about it.
- **Look at both themes.** Check your change in light and dark mode.

## Commits and PRs

Conventional commits, scoped to the area:

```
feat(mortgages): show tranche status on the loan page
fix(wallet): detect Freighter on first load
docs(readme): list the env vars
```

Keep a PR to one change. In the description say what changed and why, add a
screenshot for any visual change, and link the issue with `Fixes #123`.

## Security

Do not open a public issue for a vulnerability. See the contract repo's
[SECURITY.md](https://github.com/NeonsLabs/stellar-homes-contract/blob/main/SECURITY.md).
