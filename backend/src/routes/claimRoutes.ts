import { Router } from "express";

import { handleClaimLookup, handleClaimSubmit, handleClaimVerify } from "../controllers/claimController.js";

const router = Router();

/**
 * @openapi
 * /api/claims/lookup:
 *   post:
 *     summary: Look up a secret-based beneficiary claim
 *     tags: [Claim]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClaimLookupRequest'
 *     responses:
 *       200:
 *         description: Claim lookup data returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClaimLookupResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       404:
 *         description: Claim not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
router.post("/claims/lookup", handleClaimLookup);

/**
 * @openapi
 * /api/claims/verify:
 *   post:
 *     summary: Verify a secret answer for a beneficiary claim
 *     tags: [Claim]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClaimVerifyRequest'
 *     responses:
 *       200:
 *         description: Secret answer verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClaimVerifyResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       401:
 *         description: Incorrect secret answer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       404:
 *         description: Claim not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
router.post("/claims/verify", handleClaimVerify);

/**
 * @openapi
 * /api/claims/submit:
 *   post:
 *     summary: Resolve a beneficiary wallet and attempt to claim inheritance
 *     tags: [Claim]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClaimSubmitRequest'
 *     responses:
 *       200:
 *         description: Claim submission processed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClaimSubmitResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       401:
 *         description: Incorrect secret answer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       404:
 *         description: Claim not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       409:
 *         description: Beneficiary already resolved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
router.post("/claims/submit", handleClaimSubmit);

export default router;
