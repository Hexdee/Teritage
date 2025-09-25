## Teritage Monorepo Overview

This repository hosts the three pieces that power Teritage:

- `app/` &mdash; Next.js 15 client for onboarding, inheritance configuration, and post-onboarding dashboards.
- `backend/` &mdash; TypeScript/Express service backed by MongoDB for authentication, plan storage, wallet summaries, notifications, and Swagger docs.
- `smart-contract/` &mdash; Hardhat workspace containing the on-chain `TeritageInheritance` contract and tests.

Each package is self-contained with its own `pnpm` workspace; install dependencies per package (see below).

## Quick Start

```bash
# 1. Clone the repo, then inside each workspace run:

pnpm install            # root dependencies for the Next.js app

cd backend
pnpm install

cd ../smart-contract
pnpm install
```

### Environment

- Backend expects a MongoDB connection string plus auth/SMTP/Hedera configuration (details in `backend/README.md`).
- Smart contract tests run locally via Hardhat and do not require external RPC endpoints.

## Package Scripts

### Frontend (`app/`)

```bash
pnpm dev        # run Next.js with Turbopack
pnpm build      # production build
pnpm lint       # lint source
```

### Backend (`backend/`)

```bash
pnpm dev        # tsx watch mode on http://localhost:4000
pnpm build      # compile to dist/
pnpm start      # run compiled server
pnpm lint       # eslint type checks
```

### Smart Contracts (`smart-contract/`)

```bash
pnpm test       # Hardhat test suite
pnpm build      # optional, compiles contracts
```

## Documentation

- `smart-contract/README.md` &mdash; details on the Solidity contract supporting ERC-20, HTS, and HBAR inheritance flows plus test coverage.
- `backend/README.md` &mdash; API capabilities, environment variables, and key routes exposed via Swagger.
- The frontend code is organised by journey (auth, wallet connection, inheritance setup, dashboard). Forms currently log and route locally; integrate them with backend endpoints and contract calls as required.
