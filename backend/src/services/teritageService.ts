import { nanoid } from "nanoid";

import { ITeritagePlan, TeritagePlanModel } from "../models/TeritagePlan.js";
import { IUser, UserModel } from "../models/User.js";

const SHARE_TOTAL = 100;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export interface CreateTeritagePayload {
  ownerAddress: string;
  user: ITeritagePlan["user"];
  inheritors: ITeritagePlan["inheritors"];
  tokens: ITeritagePlan["tokens"];
  checkInIntervalSeconds: number;
  socialLinks?: string[];
  notifyBeneficiary?: boolean;
}

export interface UpdateTeritagePayload {
  user?: Partial<ITeritagePlan["user"]>;
  inheritors?: ITeritagePlan["inheritors"];
  tokens?: ITeritagePlan["tokens"];
  checkInIntervalSeconds?: number;
  socialLinks?: string[];
  notifyBeneficiary?: boolean;
}

export async function createTeritagePlan(payload: CreateTeritagePayload): Promise<ITeritagePlan> {
  const existing = await TeritagePlanModel.findOne({ ownerAddress: payload.ownerAddress.toLowerCase() });
  if (existing) {
    throw new Error("Teritage plan already exists for this owner");
  }

  validateInheritors(payload.inheritors);
  const normalizedTokens = normalizeAndValidateTokens(payload.tokens);

  const now = new Date();

  const plan = await TeritagePlanModel.create({
    ownerAddress: payload.ownerAddress.toLowerCase(),
    user: payload.user,
    inheritors: payload.inheritors,
    tokens: normalizedTokens,
    checkInIntervalSeconds: payload.checkInIntervalSeconds,
    lastCheckInAt: now,
    socialLinks: payload.socialLinks ?? [],
    notifyBeneficiary: payload.notifyBeneficiary ?? false,
    activities: [buildActivity("PLAN_CREATED", {
      inheritorCount: payload.inheritors.length,
      tokenCount: normalizedTokens.length,
      checkInIntervalSeconds: payload.checkInIntervalSeconds
    })]
  });

  return plan;
}

export async function updateTeritagePlan(
  ownerAddress: string,
  updates: UpdateTeritagePayload
): Promise<ITeritagePlan> {
  const plan = await TeritagePlanModel.findOne({ ownerAddress: ownerAddress.toLowerCase() });
  if (!plan) {
    throw new Error("Teritage plan not found");
  }

  let changed = false;

  if (updates.user) {
    plan.user = { ...plan.user, ...updates.user };
    changed = true;
  }

  if (updates.inheritors) {
    validateInheritors(updates.inheritors);
    plan.inheritors = updates.inheritors;
    changed = true;
  }

  if (updates.tokens) {
    const normalizedTokens = normalizeAndValidateTokens(updates.tokens);
    plan.tokens = normalizedTokens;
    changed = true;
  }

  if (typeof updates.checkInIntervalSeconds === "number") {
    if (updates.checkInIntervalSeconds <= 0) {
      throw new Error("Check-in interval must be positive");
    }
    plan.checkInIntervalSeconds = updates.checkInIntervalSeconds;
    changed = true;
  }

  if (updates.socialLinks) {
    plan.socialLinks = updates.socialLinks;
    changed = true;
  }

  if (typeof updates.notifyBeneficiary === "boolean") {
    plan.notifyBeneficiary = updates.notifyBeneficiary;
    changed = true;
  }

  if (!changed) {
    return plan;
  }

  plan.activities.push(buildActivity("PLAN_UPDATED", { fields: Object.keys(updates) }));
  await plan.save();
  return plan;
}

export async function getTeritagePlan(ownerAddress: string): Promise<ITeritagePlan | null> {
  return TeritagePlanModel.findOne({ ownerAddress: ownerAddress.toLowerCase() });
}

export async function upsertOwnerProfile(email: string, data: Partial<IUser>): Promise<IUser> {
  const user = await UserModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: data },
    { new: true, upsert: true, runValidators: true }
  );
  return user;
}

export async function recordCheckIn(
  ownerAddress: string,
  payload: { triggeredBy?: string; note?: string; timestamp?: string }
): Promise<ITeritagePlan> {
  const plan = await TeritagePlanModel.findOne({ ownerAddress: ownerAddress.toLowerCase() });
  if (!plan) {
    throw new Error("Teritage plan not found");
  }

  const now = payload.timestamp ? new Date(payload.timestamp) : new Date();
  const previous = plan.lastCheckInAt ?? plan.createdAt ?? now;
  const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - previous.getTime()) / 1000));
  const timelinessPercent = calculateTimeliness(plan.checkInIntervalSeconds, elapsedSeconds);

  plan.lastCheckInAt = now;
  plan.checkIns.push({
    id: nanoid(),
    timestamp: now,
    secondsSinceLast: elapsedSeconds,
    timelinessPercent,
    triggeredBy: payload.triggeredBy,
    note: payload.note
  });

  plan.activities.push(
    buildActivity("CHECK_IN", {
      secondsSinceLast: elapsedSeconds,
      timelinessPercent,
      triggeredBy: payload.triggeredBy
    })
  );

  await plan.save();
  return plan;
}

export async function recordClaim(ownerAddress: string, payload: { initiatedBy: string; note?: string }): Promise<ITeritagePlan> {
  const plan = await TeritagePlanModel.findOne({ ownerAddress: ownerAddress.toLowerCase() });
  if (!plan) {
    throw new Error("Teritage plan not found");
  }

  plan.isClaimInitiated = true;
  plan.activities.push(
    buildActivity("CLAIM_TRIGGERED", {
      initiatedBy: payload.initiatedBy,
      note: payload.note
    })
  );

  await plan.save();
  return plan;
}

export async function listActivities(ownerAddress: string) {
  const plan = await getTeritagePlan(ownerAddress);
  return plan ? plan.activities : [];
}

export async function listCheckIns(ownerAddress: string) {
  const plan = await getTeritagePlan(ownerAddress);
  return plan ? plan.checkIns : [];
}

function validateInheritors(inheritors: ITeritagePlan["inheritors"]): void {
  if (!inheritors.length) {
    throw new Error("At least one inheritor is required");
  }

  const seen = new Set<string>();
  let total = 0;

  for (const inheritor of inheritors) {
    const address = inheritor.address.trim().toLowerCase();
    if (!address) {
      throw new Error("Inheritor address is required");
    }
    if (seen.has(address)) {
      throw new Error("Duplicate inheritor address detected");
    }
    if (inheritor.sharePercentage <= 0) {
      throw new Error("Inheritor share must be greater than 0");
    }
    total += inheritor.sharePercentage;
    seen.add(address);
  }

  if (total !== SHARE_TOTAL) {
    throw new Error("Inheritor shares must sum to 100");
  }
}

function normalizeAndValidateTokens(tokens: ITeritagePlan["tokens"]): ITeritagePlan["tokens"] {
  if (!tokens.length) {
    throw new Error("At least one token is required");
  }

  const normalizedTokens: ITeritagePlan["tokens"] = [];
  const seen = new Set<string>();
  let hbarSeen = false;

  for (const token of tokens) {
    const type = token.type;
    if (!type || !["ERC20", "HTS", "HBAR"].includes(type)) {
      throw new Error("Unsupported token type provided");
    }

    let address = token.address?.trim() ?? "";

    if (type === "HBAR") {
      if (hbarSeen) {
        throw new Error("HBAR can only be listed once");
      }
      hbarSeen = true;

      if (!address || address.toLowerCase() === "hbar") {
        address = ZERO_ADDRESS;
      }

      address = address.toLowerCase();
      if (address !== ZERO_ADDRESS) {
        throw new Error("HBAR token must use the zero address or 'HBAR'");
      }

      normalizedTokens.push({ address, type });
      continue;
    }

    if (!address) {
      throw new Error("Token address is required");
    }

    address = address.toLowerCase();

    if (address === ZERO_ADDRESS) {
      throw new Error("Zero address is reserved for HBAR tokens");
    }

    if (seen.has(address)) {
      throw new Error("Token list contains duplicates");
    }

    seen.add(address);
    normalizedTokens.push({ address, type });
  }

  return normalizedTokens;
}

function calculateTimeliness(intervalSeconds: number, elapsedSeconds: number): number {
  if (!intervalSeconds) {
    return 0;
  }
  if (elapsedSeconds >= intervalSeconds) {
    return 0;
  }
  const remaining = intervalSeconds - elapsedSeconds;
  return Math.round((remaining / intervalSeconds) * 100);
}

function buildActivity(type: ITeritagePlan["activities"][number]["type"], metadata?: Record<string, unknown>) {
  return {
    id: nanoid(),
    type,
    description: humanizeActivity(type),
    metadata,
    timestamp: new Date(),
  } as unknown as ITeritagePlan["activities"][number];
}

function humanizeActivity(type: ITeritagePlan["activities"][number]["type"]): string {
  switch (type) {
    case "PLAN_CREATED":
      return "Teritage plan created";
    case "PLAN_UPDATED":
      return "Teritage plan updated";
    case "CHECK_IN":
      return "Owner check-in recorded";
    case "CLAIM_TRIGGERED":
      return "Inheritance claim initiated";
    default:
      return "Activity";
  }
}
