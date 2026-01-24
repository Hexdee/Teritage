import { Response } from "express";
import { z } from "zod";

import { lookupClaimByOwnerEmail, submitClaim, verifyClaimAnswer } from "../services/claimService.js";
import { ApiError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

const lookupSchema = z.object({
  ownerEmail: z.string().trim().email(),
  beneficiaryEmail: z.string().trim().email().optional()
});

const verifySchema = z.object({
  ownerAddress: z.string().trim().min(1),
  inheritorIndex: z.number().int().nonnegative(),
  secretAnswer: z.string().trim().min(1)
});

const submitSchema = z.object({
  ownerAddress: z.string().trim().min(1),
  inheritorIndex: z.number().int().nonnegative(),
  secretAnswer: z.string().trim().min(1),
  beneficiaryWallet: z.string().trim().min(1)
});

export async function handleClaimLookup(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const payload = lookupSchema.parse(_req.body ?? {});
    const result = await lookupClaimByOwnerEmail(payload.ownerEmail, payload.beneficiaryEmail);
    res.json(result);
  } catch (error) {
    handleClaimError("handleClaimLookup", error, res);
  }
}

export async function handleClaimVerify(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const payload = verifySchema.parse(_req.body ?? {});
    await verifyClaimAnswer(payload.ownerAddress, payload.inheritorIndex, payload.secretAnswer);
    res.json({ valid: true });
  } catch (error) {
    handleClaimError("handleClaimVerify", error, res);
  }
}

export async function handleClaimSubmit(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const payload = submitSchema.parse(_req.body ?? {});
    const result = await submitClaim(payload);
    res.json(result);
  } catch (error) {
    handleClaimError("handleClaimSubmit", error, res);
  }
}

function handleClaimError(context: string, err: unknown, res: Response) {
  if (err instanceof ApiError) {
    logger.error(`[${context}] ${err.message}`, err);
    res.status(err.status).json({ message: err.message });
    return;
  }

  if (err instanceof Error) {
    logger.error(`[${context}] ${err.message}`, err);
    res.status(500).json({ message: err.message });
  } else {
    logger.error(`[${context}] Unexpected error`, err);
    res.status(500).json({ message: "Unexpected error" });
  }
}
