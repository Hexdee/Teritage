import { Router } from "express";

import { handleGetTokenBalances, handleGetWalletSummary } from "../controllers/walletController.js";
import { authenticate } from "../middleware/auth.js";

const walletRouter = Router();

/**
 * @openapi
 * /api/wallets/tokens:
 *   get:
 *     summary: Fetch Hedera token balances for an account
 *     security:
 *       - bearerAuth: []
 *     tags: [Wallet]
 *     parameters:
 *       - in: query
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tokens retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WalletTokensResponse'
 *       400:
 *         description: Unable to fetch balances
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
*/
walletRouter.get("/wallets/tokens", authenticate, handleGetTokenBalances);

/**
 * @openapi
 * /api/wallets/{ownerAddress}/summary:
 *   get:
 *     summary: Retrieve wallet summary and allocation insights
 *     security:
 *       - bearerAuth: []
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: ownerAddress
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wallet summary retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WalletSummaryResponse'
 *       400:
 *         description: Unable to fetch summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
*/
walletRouter.get("/wallets/:ownerAddress/summary", authenticate, handleGetWalletSummary);

export default walletRouter;
