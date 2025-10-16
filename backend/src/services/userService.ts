import { Types } from "mongoose";

import { IUser, UserModel } from "../models/User.js";
import { ApiError } from "../utils/errors.js";
import { compareCode, comparePassword, hashCode, hashPassword } from "../utils/password.js";

export interface UserProfileDto {
  id: string;
  email: string;
  username?: string;
  name: string | null;
  phone: string | null;
  notes: string | null;
  allowNotifications: boolean;
  walletAddresses: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfilePayload {
  name?: string | null;
  phone?: string | null;
  notes?: string | null;
  allowNotifications?: boolean;
}

export async function getUserProfile(userId: string): Promise<UserProfileDto> {
  const user = await findUserById(userId);
  return sanitizeUser(user);
}

export async function updateUserProfile(userId: string, updates: UpdateProfilePayload): Promise<UserProfileDto> {
  const user = await findUserById(userId);

  if (typeof updates.name === "string") {
    user.name = updates.name.trim();
  }
  if (updates.name === null) {
    user.name = undefined;
  }

  if (typeof updates.phone === "string") {
    user.phone = updates.phone.trim();
  }
  if (updates.phone === null) {
    user.phone = undefined;
  }

  if (typeof updates.notes === "string") {
    user.notes = updates.notes.trim();
  }
  if (updates.notes === null) {
    user.notes = undefined;
  }

  if (typeof updates.allowNotifications === "boolean") {
    user.allowNotifications = updates.allowNotifications;
  }

  await user.save();
  return sanitizeUser(user);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = await findUserById(userId);
  if (!user.passwordHash) {
    throw new ApiError(400, "Password has not been set for this account");
  }

  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
}

export async function verifyPin(userId: string, pin: string): Promise<{ valid: boolean; hasPin: boolean }> {
  const user = await findUserById(userId);
  if (!user.pinHash) {
    return { valid: true, hasPin: false };
  }
  const valid = await compareCode(pin, user.pinHash);
  return { valid, hasPin: true };
}

export async function changePin(userId: string, currentPin: string | undefined, newPin: string): Promise<void> {
  const user = await findUserById(userId);

  if (!user.pinHash) {
    throw new ApiError(400, "No PIN set for this account. Use the create PIN endpoint first.");
  }

  if (!currentPin) {
    throw new ApiError(400, "Current PIN is required");
  }

  const isMatch = await compareCode(currentPin, user.pinHash);
  if (!isMatch) {
    throw new ApiError(400, "Current PIN is incorrect");
  }

  user.pinHash = await hashCode(newPin);
  await user.save();
}

export async function createPin(userId: string, pin: string): Promise<void> {
  const user = await findUserById(userId);
  if (user.pinHash) {
    throw new ApiError(400, "PIN already exists. Use the update endpoint instead.");
  }
  user.pinHash = await hashCode(pin);
  await user.save();
}

export async function updateWalletAddresses(userId: string, addresses: string[]): Promise<UserProfileDto> {
  const user = await findUserById(userId);
  const sanitized = Array.from(
    new Set(
      addresses
        .map((address) => address.trim())
        .filter((address) => address.length > 0)
        .map((address) => (address.startsWith("0x") ? address.toLowerCase() : address))
    )
  );

  user.walletAddresses = sanitized;
  await user.save();
  return sanitizeUser(user);
}

function sanitizeUser(user: IUser): UserProfileDto {
  return {
    id: user.id,
    email: user.email,
    username: user.username ?? undefined,
    name: user.name ?? null,
    phone: user.phone ?? null,
    notes: user.notes ?? null,
    allowNotifications: user.allowNotifications,
    walletAddresses: user.walletAddresses,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

async function findUserById(userId: string): Promise<IUser> {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(404, "User not found");
  }
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
}
