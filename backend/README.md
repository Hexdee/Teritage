# Teritage Backend Service

This service powers the off-chain experience for Teritage. It persists sensitive inheritance data, proxies Hedera portfolio information, handles authentication, and bridges on-chain events to web and email notifications.

## Highlights

- **MongoDB storage** for users, Teritage plans, check-ins, and activity logs.
- **Token-aware plan model** that stores each tracked asset as `{ address, type }`, aligning with the smart contract's ERC-20/HTS/HBAR support.
- **Auth flow** with email verification, password management, sign-in, and username assignment secured by JWT.
- **Hedera helpers** to fetch ERC-20 token balances and wallet summaries for dashboard views.
- **Realtime + email notifications** via Socket.IO and a pluggable Nodemailer transport.
- **Smart contract watcher** that listens to `TeritageInheritance` events and pushes updates back into Mongo/notifications.
- **OpenAPI docs** exposed at `/docs` (powered by Swagger UI).

## Setup

```bash
pnpm install
pnpm dev        # start development server with ts-node-dev
pnpm build      # type-check and compile to dist/
pnpm start      # run the compiled server
pnpm lint       # lint TypeScript source
```

### Environment variables

Create a `.env` file or export the following variables as needed:

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port (default `4000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign access tokens |
| `JWT_EXPIRES_IN` | token lifetime (e.g. `1d`) |
| `EMAIL_FROM` | From address for transactional email |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Optional SMTP credentials (logs to console if omitted) |
| `HEDERA_API_BASE_URL` | Mirror node base URL (defaults to Hedera testnet) |
| `CONTRACT_ADDRESS`, `CONTRACT_RPC_URL` | Optional TeritageInheritance contract + RPC endpoint for event monitoring |

## REST Endpoints (key routes)

All endpoints are documented in Swagger at `/docs`. Highlights include:

- `POST /api/auth/signup/request-code` → send verification code
- `POST /api/auth/signup/verify` → verify code
- `POST /api/auth/signup/set-password` → create account
- `POST /api/auth/signin` → obtain JWT access token
- `POST /api/auth/password/forgot` / `verify` / `reset`
- `POST /api/auth/username` → set unique username (auth required)
- `POST /api/teritages` → create plan (auth required)
- `PUT /api/teritages/:ownerAddress` → update plan sections
- `GET /api/teritages/:ownerAddress` → plan snapshot + check-in status
- `POST /api/teritages/:ownerAddress/checkins` → record heartbeat
- `POST /api/teritages/:ownerAddress/claims` → log inheritance claim
- `GET /api/wallets/tokens?accountId=…` → Hedera token balances
- `GET /api/wallets/:ownerAddress/summary?accountId=…` → portfolio totals + allocation insights

Authentication uses a Bearer JWT header (`Authorization: Bearer <token>`).

> **Token payloads**: `tokens` should be submitted as an array of objects shaped like `{ "address": "0x...", "type": "ERC20" | "HTS" | "HBAR" }`. For HBAR, supply either the zero address or the string `HBAR` (the API normalises it internally).

## Notifications & Contract Events

`src/services/notificationService.ts` bootstraps Socket.IO and exposes helpers to emit events or send transactional emails. `src/services/contractWatcher.ts` can listen to the on-chain `TeritageInheritance` contract (when RPC/env vars are configured) and relay events back to Mongo + connected clients.

## Development Notes

- Mongo indexes are created via Mongoose schema definitions; run a real MongoDB instance locally or via Atlas.
- Hedera pricing data is stubbed at `0` pending integration with a pricing oracle.
- Email delivery falls back to console logging when SMTP credentials are not supplied.
- Swagger docs are generated from route JSDoc blocks (`src/routes/*.ts`).
