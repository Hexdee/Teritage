import { Types } from "mongoose";
import { nanoid } from "nanoid";

import { ITeritagePlan, TeritagePlanModel } from "../models/TeritagePlan.js";
import { IUser, UserModel } from "../models/User.js";
import { sendEmail } from "../utils/email.js";
import { logger } from "../utils/logger.js";

const SHARE_TOTAL = 100;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export interface CreateTeritagePayload {
  ownerAddress: string;
  inheritors: ITeritagePlan["inheritors"];
  tokens: ITeritagePlan["tokens"];
  checkInIntervalSeconds: number;
  socialLinks?: string[];
  notifyBeneficiary?: boolean;
}

export interface UpdateTeritagePayload {
  inheritors?: ITeritagePlan["inheritors"];
  tokens?: ITeritagePlan["tokens"];
  checkInIntervalSeconds?: number;
  socialLinks?: string[];
  notifyBeneficiary?: boolean;
}

export async function createTeritagePlan(ownerAccountId: string, payload: CreateTeritagePayload): Promise<ITeritagePlan> {
  if (!Types.ObjectId.isValid(ownerAccountId)) {
    throw new Error("Invalid owner account identifier");
  }

  const ownerAccount = new Types.ObjectId(ownerAccountId);
  const normalizedAddress = payload.ownerAddress.trim().toLowerCase();

  const owner = await UserModel.findById(ownerAccount);
  if (!owner) {
    throw new Error("Owner account not found");
  }

  let shouldSaveOwner = false;

  if (!owner.name) {
    owner.name = owner.username ?? owner.email;
    shouldSaveOwner = true;
  }

  const ownerWalletAddress = payload.ownerAddress.trim();
  const existingWalletAddresses = Array.isArray(owner.walletAddresses) ? owner.walletAddresses : [];
  const hasWalletAddress = existingWalletAddresses.some(
    (address) => address.trim().toLowerCase() === ownerWalletAddress.toLowerCase()
  );

  if (!hasWalletAddress) {
    owner.walletAddresses = [...existingWalletAddresses, ownerWalletAddress];
    shouldSaveOwner = true;
  }

  if (shouldSaveOwner) {
    await owner.save();
  }

  const existingByUser = await TeritagePlanModel.findOne({ ownerAccount });
  if (existingByUser) {
    throw new Error("Teritage plan already exists for this user");
  }

  const existingByAddress = await TeritagePlanModel.findOne({ ownerAddress: normalizedAddress });
  if (existingByAddress) {
    throw new Error("Teritage plan already exists for this owner address");
  }

  validateInheritors(payload.inheritors);
  const normalizedTokens = normalizeAndValidateTokens(payload.tokens);

  const now = new Date();

  const plan = await TeritagePlanModel.create({
    ownerAddress: normalizedAddress,
    ownerAccount,
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
    })],
    checkIns: []
  });

  await plan.populate<{ ownerAccount: IUser }>("ownerAccount");

  if (plan.notifyBeneficiary) {
    await notifyBeneficiariesByEmail(plan, owner);
  }

  return plan;
}

export async function updateTeritagePlan(ownerAccountId: string, updates: UpdateTeritagePayload): Promise<ITeritagePlan> {
  if (!Types.ObjectId.isValid(ownerAccountId)) {
    throw new Error("Invalid owner account identifier");
  }

  const ownerAccount = new Types.ObjectId(ownerAccountId);
  const plan = await TeritagePlanModel.findOne({ ownerAccount });
  if (!plan) {
    throw new Error("Teritage plan not found");
  }

  await plan.populate<{ ownerAccount: IUser }>("ownerAccount");

  let changed = false;
  let shouldSendNotifications = false;

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
    if (updates.notifyBeneficiary && !plan.notifyBeneficiary) {
      shouldSendNotifications = true;
    }
    plan.notifyBeneficiary = updates.notifyBeneficiary;
    changed = true;
  }

  if (!changed) {
    return plan;
  }

  plan.activities.push(buildActivity("PLAN_UPDATED", { fields: Object.keys(updates) }));
  await plan.save();
  await plan.populate<{ ownerAccount: IUser }>("ownerAccount");

  if (shouldSendNotifications && plan.notifyBeneficiary) {
    const ownerDoc = plan.ownerAccount as IUser;
    await notifyBeneficiariesByEmail(plan, ownerDoc);
  }

  return plan;
}

export async function getTeritagePlan(ownerAccountId: string): Promise<ITeritagePlan | null> {
  if (!Types.ObjectId.isValid(ownerAccountId)) {
    return null;
  }

  const ownerAccount = new Types.ObjectId(ownerAccountId);
  return TeritagePlanModel.findOne({ ownerAccount }).populate<{ ownerAccount: IUser }>("ownerAccount");
}

export async function getTeritagePlanByOwnerAddress(ownerAddress: string): Promise<ITeritagePlan | null> {
  return TeritagePlanModel.findOne({ ownerAddress: ownerAddress.toLowerCase() }).populate<{ ownerAccount: IUser }>(
    "ownerAccount"
  );
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
  ownerAccountId: string,
  payload: { triggeredBy?: string; note?: string; timestamp?: string }
): Promise<ITeritagePlan> {
  if (!Types.ObjectId.isValid(ownerAccountId)) {
    throw new Error("Invalid owner account identifier");
  }

  const ownerAccount = new Types.ObjectId(ownerAccountId);
  const plan = await TeritagePlanModel.findOne({ ownerAccount });
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
  await plan.populate<{ ownerAccount: IUser }>("ownerAccount");
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
  await plan.populate<{ ownerAccount: IUser }>("ownerAccount");
  return plan;
}

export async function listActivities(ownerAccountId: string) {
  const plan = await getTeritagePlan(ownerAccountId);
  return plan ? plan.activities : [];
}

export async function listCheckIns(ownerAccountId: string) {
  const plan = await getTeritagePlan(ownerAccountId);
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

  if (total > SHARE_TOTAL) {
    throw new Error("Inheritor shares cannot exceed 100");
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

async function notifyBeneficiariesByEmail(plan: ITeritagePlan, owner: IUser | null | undefined) {
  if (!owner) {
    return;
  }

  const recipients = plan.inheritors
    .map((inheritor) => ({
      email: inheritor.email?.trim(),
      name: inheritor.name?.trim(),
      sharePercentage: inheritor.sharePercentage
    }))
    .filter((recipient) => recipient.email);

  if (!recipients.length) {
    return;
  }

  const ownerName = owner.name?.trim() || owner.username?.trim() || owner.email;
  const subject = `${ownerName} added you as a Teritage beneficiary`;

  const emailTasks = recipients.map(async (recipient) => {
    const greeting = recipient.name ? `Hi ${recipient.name},` : "Hello,";
    const shareText =
      typeof recipient.sharePercentage === "number"
        ? `<p>Your allocation: <strong>${recipient.sharePercentage}%</strong></p>`
        : "";

    const html = `
      <p>${greeting}</p>
      <p>${ownerName} just created a Teritage inheritance plan and listed you as a beneficiary.</p>
      ${shareText}
      <p>Teritage securely tracks assets and requires periodic check-ins from the plan owner. If they miss their check-in window, beneficiaries can initiate a claim.</p>
      <p>We recommend keeping this email for your records. If you have questions, please reach out to ${ownerName} directly.</p>
      <p>— The Teritage Team</p>
    `;

    try {
      await sendEmail({
        to: recipient.email as string,
        subject,
        html
      });
    } catch (error) {
      logger.warn("Failed to send beneficiary notification email", {
        email: recipient.email,
        error
      });
    }
  });

  await Promise.all(emailTasks);
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
