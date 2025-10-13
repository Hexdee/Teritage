import { Request, Response } from "express";
import { z } from "zod";

import { getWalletSummary, getWalletTokens } from "../services/walletService.js";
import { ApiError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export async function handleGetTokenBalances(req: Request, res: Response): Promise<void> {
  try {
    const paramsSchema = z.object({ ownerAddress: z.string().trim().min(1) });
    const { ownerAddress } = paramsSchema.parse(req.params);
    const tokens = await getWalletTokens(ownerAddress);
    res.json({ tokens });
  } catch (error) {
    handleControllerError("handleGetTokenBalances", error, res);
  }
}

export async function handleGetWalletSummary(req: Request, res: Response): Promise<void> {
  try {
    const paramsSchema = z.object({ ownerAddress: z.string().trim().min(1) });
    const { ownerAddress } = paramsSchema.parse(req.params);
    const summary = await getWalletSummary(ownerAddress);
    res.json({ summary });
  } catch (error) {
    handleControllerError("handleGetWalletSummary", error, res);
  }
}

function handleControllerError(context: string, err: unknown, res: Response) {
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
