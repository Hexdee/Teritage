import { Request, Response } from "express";
import { z } from "zod";

import { ITeritagePlan } from "../models/TeritagePlan.js";
import {
  createTeritagePlan,
  getTeritagePlan,
  listActivities,
  listCheckIns,
  recordCheckIn,
  recordClaim,
  updateTeritagePlan} from "../services/teritageService.js";
import { ApiError } from "../utils/errors.js";

const inheritorSchema = z.object({
  address: z.string().trim().min(1),
  sharePercentage: z.number().int().min(1).max(100),
  name: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

const tokenSchema = z
  .object({
    address: z.string().trim().optional(),
    type: z.enum(["ERC20", "HTS", "HBAR"])
  })
  .superRefine((token, ctx) => {
    if (token.type !== "HBAR" && (!token.address || token.address.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Token address is required for ERC20 and HTS entries",
        path: ["address"]
      });
    }
  });

const userSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

const createSchema = z.object({
  ownerAddress: z.string().trim().min(1),
  user: userSchema,
  inheritors: z.array(inheritorSchema).min(1),
  tokens: z.array(tokenSchema).min(1),
  checkInIntervalSeconds: z.number().int().positive(),
  socialLinks: z.array(z.string().url()).optional(),
  notifyBeneficiary: z.boolean().optional()
});

const updateSchema = z.object({
  user: userSchema.partial().optional(),
  inheritors: z.array(inheritorSchema).min(1).optional(),
  tokens: z.array(tokenSchema).min(1).optional(),
  checkInIntervalSeconds: z.number().int().positive().optional(),
  socialLinks: z.array(z.string().url()).optional(),
  notifyBeneficiary: z.boolean().optional()
});

export async function handleCreateTeritage(req: Request, res: Response): Promise<void> {
  try {
    const payload = createSchema.parse(req.body);
    const plan = await createTeritagePlan({
      ...payload,
      tokens: payload.tokens.map((token) => ({
        type: token.type,
        address: token.address ?? ""
      }))
    });
    res.status(201).json({ plan: serializePlan(plan) });
  } catch (error) {
    handleControllerError("handleCreateTeritage", error, res);
  }
}

export async function handleUpdateTeritage(req: Request, res: Response): Promise<void> {
  try {
    const payload = updateSchema.parse(req.body);
    const ownerAddress = z.string().trim().min(1).parse(req.params.ownerAddress);
    const plan = await updateTeritagePlan(ownerAddress, {
      ...payload,
      tokens: payload.tokens
        ? payload.tokens.map((token) => ({
            type: token.type,
            address: token.address ?? ""
          }))
        : undefined
    });
    res.json({ plan: serializePlan(plan) });
  } catch (error) {
    handleControllerError("handleUpdateTeritage", error, res);
  }
}

export async function handleGetTeritage(req: Request, res: Response): Promise<void> {
  try {
    const ownerAddress = z.string().trim().min(1).parse(req.params.ownerAddress);
    const plan = await getTeritagePlan(ownerAddress);
    if (!plan) {
      res.status(404).json({ message: "Teritage plan not found" });
      return;
    }
    const status = deriveStatus(plan.checkInIntervalSeconds, plan.lastCheckInAt, plan.isClaimInitiated);
    res.json({ plan: serializePlan(plan), status });
  } catch (error) {
    handleControllerError("handleGetTeritage", error, res);
  }
}

export async function handleListActivities(req: Request, res: Response): Promise<void> {
  try {
    const ownerAddress = z.string().trim().min(1).parse(req.params.ownerAddress);
    const activities = await listActivities(ownerAddress);
    res.json({ activities });
  } catch (error) {
    handleControllerError("handleListActivities", error, res);
  }
}

export async function handleListCheckIns(req: Request, res: Response): Promise<void> {
  try {
    const ownerAddress = z.string().trim().min(1).parse(req.params.ownerAddress);
    const checkIns = await listCheckIns(ownerAddress);
    res.json({ checkIns });
  } catch (error) {
    handleControllerError("handleListCheckIns", error, res);
  }
}

export async function handleGetLatestCheckIn(req: Request, res: Response): Promise<void> {
  try {
    const ownerAddress = z.string().trim().min(1).parse(req.params.ownerAddress);
    const checkIns = await listCheckIns(ownerAddress);
    if (!checkIns.length) {
      res.status(404).json({ message: "No check-ins recorded" });
      return;
    }
    res.json({ latest: checkIns[checkIns.length - 1] });
  } catch (error) {
    handleControllerError("handleGetLatestCheckIn", error, res);
  }
}

export async function handleRecordCheckIn(req: Request, res: Response): Promise<void> {
  try {
    const ownerAddress = z.string().trim().min(1).parse(req.params.ownerAddress);
    const payload = z
      .object({
        triggeredBy: z.string().trim().optional(),
        note: z.string().trim().optional(),
        timestamp: z.string().datetime().optional()
      })
      .parse(req.body ?? {});
    const plan = await recordCheckIn(ownerAddress, payload);
    const status = deriveStatus(plan.checkInIntervalSeconds, plan.lastCheckInAt, plan.isClaimInitiated);
    res.status(201).json({ plan: serializePlan(plan), status });
  } catch (error) {
    handleControllerError("handleRecordCheckIn", error, res);
  }
}

export async function handleRecordClaim(req: Request, res: Response): Promise<void> {
  try {
    const ownerAddress = z.string().trim().min(1).parse(req.params.ownerAddress);
    const payload = z
      .object({ initiatedBy: z.string().trim().min(1), note: z.string().trim().optional() })
      .parse(req.body);
    const plan = await recordClaim(ownerAddress, payload);
    const status = deriveStatus(plan.checkInIntervalSeconds, plan.lastCheckInAt, plan.isClaimInitiated);
    res.status(201).json({ plan: serializePlan(plan), status });
  } catch (error) {
    handleControllerError("handleRecordClaim", error, res);
  }
}

function deriveStatus(interval: number, lastCheckInAt: Date, isClaimInitiated: boolean) {
  const last = new Date(lastCheckInAt);
  const nextDue = new Date(last.getTime() + interval * 1000);
  const now = new Date();
  const secondsUntilDue = Math.max(0, Math.floor((nextDue.getTime() - now.getTime()) / 1000));
  const isOverdue = now > nextDue;

  return {
    lastCheckInAt: last.toISOString(),
    nextCheckInDueAt: nextDue.toISOString(),
    secondsUntilDue,
    isOverdue,
    isClaimInitiated
  };
}

function serializePlan(plan: ITeritagePlan) {
  return plan.toObject({ versionKey: false });
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
