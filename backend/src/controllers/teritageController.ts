import { Response } from "express";
import { z } from "zod";

import { AuthenticatedRequest } from "../middleware/auth.js";
import { ITeritagePlan } from "../models/TeritagePlan.js";
import { IUser } from "../models/User.js";
import {
  createTeritagePlan,
  getTeritagePlan,
  listActivities,
  listCheckIns,
  recordCheckIn,
  recordClaim,
  updateTeritagePlan,
} from "../services/teritageService.js";
import { ApiError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

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

const createSchema = z.object({
  ownerAddress: z.string().trim().min(1),
  inheritors: z.array(inheritorSchema).min(1),
  tokens: z.array(tokenSchema).min(1),
  checkInIntervalSeconds: z.number().int().positive(),
  socialLinks: z.array(z.string().url()).optional(),
  notifyBeneficiary: z.boolean().optional()
});

const updateSchema = z.object({
  inheritors: z.array(inheritorSchema).min(1).optional(),
  tokens: z.array(tokenSchema).min(1).optional(),
  checkInIntervalSeconds: z.number().int().positive().optional(),
  socialLinks: z.array(z.string().url()).optional(),
  notifyBeneficiary: z.boolean().optional()
});

export async function handleCreateTeritage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const payload = createSchema.parse(req.body);
    const plan = await createTeritagePlan(req.userId, {
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

export async function handleUpdateTeritage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const payload = updateSchema.parse(req.body);
    const plan = await updateTeritagePlan(req.userId, {
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

export async function handleGetTeritage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const plan = await getTeritagePlan(req.userId);
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

export async function handleListActivities(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const activities = await listActivities(req.userId);
    res.json({ activities });
  } catch (error) {
    handleControllerError("handleListActivities", error, res);
  }
}

export async function handleListCheckIns(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const checkIns = await listCheckIns(req.userId);
    res.json({ checkIns });
  } catch (error) {
    handleControllerError("handleListCheckIns", error, res);
  }
}

export async function handleGetLatestCheckIn(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const checkIns = await listCheckIns(req.userId);
    if (!checkIns.length) {
      res.status(404).json({ message: "No check-ins recorded" });
      return;
    }
    res.json({ latest: checkIns[checkIns.length - 1] });
  } catch (error) {
    handleControllerError("handleGetLatestCheckIn", error, res);
  }
}

export async function handleRecordCheckIn(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const payload = z
      .object({
        triggeredBy: z.string().trim().optional(),
        note: z.string().trim().optional(),
        timestamp: z.string().datetime().optional()
      })
      .parse(req.body ?? {});
    const plan = await recordCheckIn(req.userId, payload);
    const status = deriveStatus(plan.checkInIntervalSeconds, plan.lastCheckInAt, plan.isClaimInitiated);
    res.status(201).json({ plan: serializePlan(plan), status });
  } catch (error) {
    handleControllerError("handleRecordCheckIn", error, res);
  }
}

export async function handleRecordClaim(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const ownerAddress = z.string().trim().min(1).parse(req.params.ownerAddress);
    const payload = z
      .object({
        initiatedBy: z.string().trim().optional(),
        note: z.string().trim().optional(),
        txHash: z.string().trim().optional()
      })
      .parse(req.body ?? {});
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
  const ownerCandidate = plan.ownerAccount as unknown;
  const plain = plan.toObject<{ ownerAccount?: unknown }>({ versionKey: false });

  const owner = isPopulatedUser(ownerCandidate) ? ownerCandidate : null;

  return {
    ...plain,
    ownerAccount: owner?.id ?? plain.ownerAccount,
    user: owner
      ? {
          name: owner.name ?? owner.username ?? owner.email,
          email: owner.email,
          phone: owner.phone ?? null,
          notes: owner.notes ?? null,
          allowNotifications: owner.allowNotifications
        }
      : null
  };
}

function isPopulatedUser(value: unknown): value is IUser & { id: string } {
  return Boolean(
    value &&
      typeof value === "object" &&
      "email" in value &&
      typeof (value as Record<string, unknown>).email === "string"
  );
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
