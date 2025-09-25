import { Request, Response } from "express";
import { z } from "zod";

import { getWalletSummary, getWalletTokens } from "../services/walletService.js";
import { ApiError } from "../utils/errors.js";

export async function handleGetTokenBalances(req: Request, res: Response): Promise<void> {
  try {
    const querySchema = z.object({ accountId: z.string().trim().min(1) });
    const { accountId } = querySchema.parse(req.query);
    const tokens = await getWalletTokens(accountId);
    res.json({ tokens });
  } catch (error) {
    handleControllerError("handleGetTokenBalances", error, res);
  }
}

export async function handleGetWalletSummary(req: Request, res: Response): Promise<void> {
  try {
    const paramsSchema = z.object({ ownerAddress: z.string().trim().min(1) });
    const querySchema = z.object({ accountId: z.string().trim().min(1) });
    const { ownerAddress } = paramsSchema.parse(req.params);
    const { accountId } = querySchema.parse(req.query);
    const summary = await getWalletSummary(ownerAddress, accountId);
    res.json({ summary });
  } catch (error) {
    handleControllerError("handleGetWalletSummary", error, res);
  }
}

function handleControllerError(context: string, err: unknown, res: Response) {
  if (err instanceof ApiError) {
    // eslint-disable-next-line no-console
    console.error(`[${context}]`, err);
    res.status(err.status).json({ message: err.message });
    return;
  }

  if (err instanceof Error) {
    // eslint-disable-next-line no-console
    console.error(`[${context}]`, err);
    res.status(500).json({ message: err.message });
  } else {
    // eslint-disable-next-line no-console
    console.error(`[${context}]`, err);
    res.status(500).json({ message: "Unexpected error" });
  }
}
