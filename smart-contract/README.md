# Teritage Smart Contracts

This package contains the unified `TeritageInheritance` smart contract that powers decentralized inheritance plans for **ERC-20**, **Hedera Token Service (HTS)** assets, and **HBAR** in a single deployment. Owners can:

- Configure inheritors and percentage shares (basis points that must sum to 10,000).
- Track any combination of ERC-20 tokens, HTS fungible tokens, and the native HBAR balance.
- Set the maximum check-in interval; missing it unlocks claims for inheritors.
- Update inheritors, token lists, social metadata (off-chain), and intervals while the plan is active.
- Manually check in to reset the inactivity timer or clear a plan prior to claims.

When the owner misses the check-in deadline, any inheritor can call `claimInheritance`. The contract fans out distributions according to the recorded basis-point splits and surfaces helpful errors when prerequisites (allowances or associations) are missing.

## Project Layout

- `contracts/TeritageInheritance.sol` — unified ERC-20/HTS/HBAR inheritance contract.
- `contracts/mocks/MockERC20.sol` — simple ERC20 used in unit tests.
- `contracts/mocks/MockHederaTokenService.sol` — lightweight mock of the Hedera precompile for local HTS/HBAR tests.
- `contracts/hedera/*.sol` — thin interfaces/codes shared by the contract and mocks.
- `test/teritage-inheritance.js` — Hardhat test suite covering happy paths and edge cases.

## Getting Started

```bash
pnpm install
pnpm build
pnpm test
```

The tests deploy the contract locally, patch the HTS precompile address with the mock implementation, and exercise:

- Mixed ERC-20 + HTS + HBAR claims
- Allowance / association failure codes for HTS and HBAR flows
- Share validation, interval guard rails, and re-entrancy protection

## Interacting with the Contract

Key external functions exposed by `TeritageInheritance`:

- `createPlan` / `updateInheritors` / `updateTokens` / `updateCheckInInterval`
- `checkIn` to refresh the last activity timestamp.
- `clearPlan` to remove an active plan prior to any claim.
- `claimInheritance` for inheritors once the owner misses the check-in deadline.
- `getPlan` and `getClaimStatus` helpers for front-end and backend consumption.

Pass two parallel arrays into `createPlan` / `updateTokens`:

- `tokens[]` — addresses or the zero address (`address(0)`) when tracking HBAR
- `tokenTypes[]` — `0 = ERC20`, `1 = HTS`, `2 = HBAR`

The contract emits events for plan lifecycle changes, check-ins, and distributions to simplify off-chain indexing.

## Allowance Requirements

- **ERC-20 tokens** — owner must approve the contract for at least the current balance of each tracked asset.
- **HTS fungible tokens** — owner and each inheritor must associate with the token; owner must approve the contract via HTS allowances. Failed transfers bubble up as `HederaTokenTransferFailed(token, responseCode)`.
- **HBAR** — owner must set an HBAR allowance for the contract (HIP-336 flow). Inheritors do not need to approve anything, but the allowance must cover the balance being distributed.

## Networks

`hardhat.config.js` includes a `hederaTestnet` network preset. Supply `HEDERA_TESTNET_RPC_URL` and `HEDERA_TESTNET_PRIVATE_KEY` in a `.env` file to deploy directly to Hedera testnet via Hardhat:

```bash
pnpm hardhat run --network hederaTestnet scripts/deploy.js
```

Adjust deployment scripts as needed for custom environments or production infrastructure.
