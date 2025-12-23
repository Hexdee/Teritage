<div align="center">

# Teritage — Secure Digital Inheritance on Hedera

Onchain Finance & RWA Track · Hedera Africa Hackathon 2025

[Demo Video](https://vimeo.com/1132648167/b2a2554523?share=copy&fl=sv&fe=ci) · [Pitch Deck](https://docs.google.com/presentation/d/1sDLyhy8KStPlNbwU438tB1EzZSPVlyvN/edit?slide=id.p1#slide=id.p1) · [DoraHacks BUIDL](https://dorahacks.io/buidl/35830) · [Hedera Developer Certificate](https://drive.google.com/file/d/1Uq7d_qDt8H5reiwHQahdF9yhIGAWvuI5/view?usp=drive_link)

</div>

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Hedera Integration Summary](#hedera-integration-summary)
3. [Architecture Diagram](#architecture-diagram)
4. [Deployed Hedera IDs](#deployed-hedera-ids)
5. [Prerequisites](#prerequisites)
6. [Step-by-Step Local Setup](#step-by-step-local-setup)
7. [Running the Apps](#running-the-apps)
8. [Sample Environment Configuration](#sample-environment-configuration)
9. [Testing](#testing)
10. [Submission Artifacts](#submission-artifacts)

---

## Project Overview

Teritage is a Hedera-powered inheritance platform that lets asset owners configure beneficiaries, assign token/HBAR allocations, and define a recurring “heartbeat” check-in.

- If the owner checks in on time, the plan remains active.
- When check-ins lapse, the Hedera smart contract triggers `claimInheritance`, distributing assets to beneficiaries via HTS allowances.
- Every claim is verifiable on HashScan for auditors, heirs, and regulators.

This monorepo contains three packages:

| Package           | Description                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `app/`            | Next.js 15 client (onboarding, dashboard, beneficiary view).                                    |
| `backend/`        | Node/Express service with MongoDB, JWT auth, notification system, and claim scheduler.          |
| `smart-contract/` | Hardhat workspace containing the `TeritageInheritance` contract, tests, and deployment scripts. |

---

## Hedera Integration Summary

| Service                                  | Implementation                                                                                                                                                                                                        | Transaction Types & Fees                                                                                                  | Economic Rationale                                                                                                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Hedera Smart Contract Service (HSCS)** | `TeritageInheritance.sol` stores plans, enforces check-in intervals, and orchestrates allowance-based payouts. Contract consumes HTS precompiles via address `0x167`.                                                 | `ContractCreateTransaction`, `ContractExecuteTransaction (claimInheritance)`                                              | ABFT finality provides deterministic execution even with intermittent African connectivity. Smart contracts eliminate custodians, reducing estate settlement time. |
| **Hedera Token Service (HTS)**           | Contract calls `redirectForToken` to read balances, `isToken` to validate tokens, `transferFrom` for HTS assets, and `cryptoTransfer` to move HBAR with approval flags. Allowances are granted via HAS before claims. | `TokenAssociateTransaction`, `CryptoApproveAllowanceTransaction`, `TokenTransfer`, `CryptoTransfer` (fees ≈ $0.0001 each) | Predictable fees allow micro-estates (<$10) to settle economically. Allowance model keeps owner custody until the claim event, fitting local regulatory needs.     |
| **Mirror Node / HashScan**               | Backend watcher and demo workflow surface transaction hashes on `hashscan.io/testnet`.                                                                                                                                | Mirror queries only (no additional cost)                                                                                  | Immutable audit trails for beneficiaries and compliance checks. Links are shared in notification emails.                                                           |

---

## Architecture Diagram

```
┌─────────────────┐      HTTPS      ┌────────────────────────┐
│ Next.js Frontend│◄───────────────►│ Express Backend (API)  │
│ (app/)          │                 │  - Auth & MongoDB      │
│  - Plan UI      │                 │  - Notification Service │
│  - Check-ins    │                 │  - Claim Scheduler      │
└────────┬────────┘                 └──────────┬─────────────┘
         │                                         │ ethers.js
         │ GraphQL/REST                            │
         ▼                                         ▼
                                   ┌────────────────────────┐
                                   │ Hedera JSON-RPC (Test) │
                                   └────────┬───────────────┘
                                            │
                                   ┌────────▼───────────────┐
                                   │ TeritageInheritance.sol│
                                   │ (HSCS + HTS precompile)│
                                   └────────┬───────────────┘
                                            │ Events / Tx
                                   ┌────────▼───────────────┐
                                   │ Hedera Mirror Node     │
                                   │ (HashScan explorer)    │
                                   └────────┬───────────────┘
                                            │
                                ┌───────────▼───────────────┐
                                │ Beneficiary Wallets (HTS) │
                                └───────────────────────────┘
```

---

## Deployed Hedera IDs

| Component                      | Testnet ID / Address                                         | Notes                                 |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------- |
| `TeritageInheritance` Contract | `0x6b14B2a2D0e956D6C05ff0b663059ed9De39e9fa`                 | Latest testnet deployment (Oct 2025). |
| Demo Owner Account             | `0.0.6520558` (`0x1b829a971FA388367A7cb1105EA2F0168565c684`) | Used in video/demo scripts.           |
| Demo Beneficiary Account       | `0.0.6534337` (`0x78086a834b6fa4D716a52A0F3Fb451a9DAB4138c`) | Receives inheritance in demo.         |
| Demo HTS Token (optional)      | `0.0.1234567` _(replace with actual if minted)_              | Update after minting test token.      |

> Update these values if you redeploy before submission.

---

## Prerequisites

- **Node.js 20+** (LTS)
- **pnpm 9+** (`npm install -g pnpm`)
- **MongoDB** (Atlas URI or local instance)
- **Hedera Testnet account** with private key for the relayer wallet
- **SMTP credentials** (for transactional emails; can use Mailtrap for testing)

---

## Step-by-Step Local Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/<org>/teritage.git
   cd teritage
   ```

2. **Install root/front-end dependencies**

   ```bash
   pnpm install          # installs app/ dependencies via workspace
   ```

3. **Install backend dependencies**

   ```bash
   cd backend
   pnpm install
   cd ..
   ```

4. **Install smart-contract dependencies**

   ```bash
   cd smart-contract
   pnpm install
   cd ..
   ```

5. **Configure environment variables**  
   Create `backend/.env` (see [Sample Environment Configuration](#sample-environment-configuration)).  
   Optionally configure `app/.env.local` if exposing additional frontend keys (not required for demo).

6. **Populate sample data (optional)**  
   Seed MongoDB or create plans via the UI once services are running.

---

## Running the Apps

> Run each service in a separate terminal window.

1. **Smart Contract (optional local testing)**

   ```bash
   cd smart-contract
   pnpm test               # runs Hardhat tests against the contract
   ```

   For on-chain demo we rely on the deployed Testnet contract, so no local node is required.

2. **Backend API**

   ```bash
   cd backend
   pnpm dev                # starts http://localhost:4000 with Hot Reload
   ```

   - Swagger docs: http://localhost:4000/api/docs
   - Claim scheduler & contract watcher start automatically when env vars are set.

3. **Frontend**
   ```bash
   pnpm dev                # from repository root
   ```
   - Access the UI at http://localhost:3000
   - Use the demo credentials supplied in the submission notes or create new accounts.

---

## Sample Environment Configuration

Create `backend/.env` with the following structure:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/teritage
JWT_SECRET=change-me

EMAIL_FROM=no-reply@teritage.app
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=YOUR_SMTP_USERNAME
SMTP_PASS=YOUR_SMTP_PASSWORD

CONTRACT_ADDRESS=0x6b14B2a2D0e956D6C05ff0b663059ed9De39e9fa
CONTRACT_RPC_URL=https://testnet.hashio.io/api
CONTRACT_RELAYER_PRIVATE_KEY=302e020100300506032b657004220420YOURPRIVATEKEY

HEDERA_API_BASE_URL=https://testnet.mirrornode.hedera.com/api/v1
CLAIM_SWEEP_INTERVAL_MS=60000
SOCKET_PING_INTERVAL=25000
SOCKET_PING_TIMEOUT=60000
```

- Provide judges with a **test owner account ID + private key** in the secure DoraHacks submission field.
- **Never** commit `.env` files or private keys to Git history.

---

## Testing

| Package         | Command                                     | Description                                   |
| --------------- | ------------------------------------------- | --------------------------------------------- |
| Frontend        | `pnpm lint`                                 | Next.js linting and type checks.              |
| Backend         | `cd backend && pnpm test` _(if configured)_ | API tests (add Vitest suites as needed).      |
| Smart Contracts | `cd smart-contract && pnpm test`            | Hardhat tests covering ERC-20/HTS/HBAR flows. |

For end-to-end verification, run the demo script in `smart-contract/scripts/deploy-and-claim.js` to exercise the claim path on Hedera Testnet.

---

## Submission Artifacts

- **Track:** Onchain Finance & RWA
- **Team Members:**
  - Temitope — Frontend Lead (React/Next.js, UX)
  - Saheed — Backend & Smart Contract Lead (Node/Express, Hedera integrations)
- **Demo Video:** see link at top of README (≤3 min, includes live HashScan proof).
- **Pitch Deck:** see link at top of README (≤20 slides with market, tech, TRL).
- **GitHub:** Public repository; `Hackathon@hashgraph-association.com` invited as collaborator.
- **Judge Credentials:** Provided securely via DoraHacks notes (Testnet owner + beneficiary accounts, private key).

---

### Need Help?

Open an issue or ping us on the DoraHacks discussion board. Teritage is continually evolving—contributions and feedback are welcome!
