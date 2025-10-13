import { Response } from "express";
import { z } from "zod";

import { AuthenticatedRequest } from "../middleware/auth.js";
import {
  changePassword,
  changePin,
  createPin,
  getUserProfile,
  updateUserProfile,
  updateWalletAddresses,
  verifyPin
} from "../services/userService.js";
import { ApiError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const profileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional().nullable(),
  phone: z.string().trim().min(3).max(32).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
  allowNotifications: z.boolean().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must include at least one special character")
});

const verifyPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, "PIN must be a 4-digit code")
});

const changePinSchema = z.object({
  currentPin: z.string().regex(/^\d{4}$/, "Current PIN must be a 4-digit code"),
  newPin: z.string().regex(/^\d{4}$/, "New PIN must be a 4-digit code")
});

const createPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, "PIN must be a 4-digit code")
});

const walletAddressesSchema = z.object({
  walletAddresses: z.array(z.string().trim().min(1)).max(20)
});

const notificationPreferencesSchema = z.object({
  allowNotifications: z.boolean()
});

export async function handleGetUserProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const profile = await getUserProfile(userId);
    res.json({ user: profile });
  } catch (error) {
    handleControllerError("handleGetUserProfile", error, res);
  }
}

export async function handleUpdateUserProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const payload = profileSchema.parse(req.body ?? {});
    const profile = await updateUserProfile(userId, payload);
    res.json({ user: profile });
  } catch (error) {
    handleControllerError("handleUpdateUserProfile", error, res);
  }
}

export async function handleChangePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body ?? {});
    await changePassword(userId, currentPassword, newPassword);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    handleControllerError("handleChangePassword", error, res);
  }
}

export async function handleVerifyPin(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const { pin } = verifyPinSchema.parse(req.body ?? {});
    const result = await verifyPin(userId, pin);
    if (!result.valid) {
      res.status(400).json({ message: "Invalid PIN" });
      return;
    }
    res.json(result);
  } catch (error) {
    handleControllerError("handleVerifyPin", error, res);
  }
}

export async function handleCreatePin(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const { pin } = createPinSchema.parse(req.body ?? {});
    await createPin(userId, pin);
    res.status(201).json({ message: "PIN created successfully" });
  } catch (error) {
    handleControllerError("handleCreatePin", error, res);
  }
}

export async function handleChangePin(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const { currentPin, newPin } = changePinSchema.parse(req.body ?? {});
    await changePin(userId, currentPin, newPin);
    res.json({ message: "PIN updated successfully" });
  } catch (error) {
    handleControllerError("handleChangePin", error, res);
  }
}

export async function handleUpdateWalletAddresses(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const { walletAddresses } = walletAddressesSchema.parse(req.body ?? {});
    const profile = await updateWalletAddresses(userId, walletAddresses);
    res.json({ user: profile });
  } catch (error) {
    handleControllerError("handleUpdateWalletAddresses", error, res);
  }
}

export async function handleGetNotificationPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const profile = await getUserProfile(userId);
    res.json({ allowNotifications: profile.allowNotifications });
  } catch (error) {
    handleControllerError("handleGetNotificationPreferences", error, res);
  }
}

export async function handleUpdateNotificationPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const { allowNotifications } = notificationPreferencesSchema.parse(req.body ?? {});
    const profile = await updateUserProfile(userId, { allowNotifications });
    res.json({ allowNotifications: profile.allowNotifications });
  } catch (error) {
    handleControllerError("handleUpdateNotificationPreferences", error, res);
  }
}

function requireUserId(req: AuthenticatedRequest, res: Response): string | null {
  if (!req.userId) {
    res.status(401).json({ message: "Authentication required" });
    return null;
  }
  return req.userId;
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
