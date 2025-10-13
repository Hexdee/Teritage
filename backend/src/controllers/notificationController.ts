import { Request, Response } from "express";
import { z } from "zod";

import { AuthenticatedRequest } from "../middleware/auth.js";
import { NotificationModel } from "../models/Notification.js";
import { registerNotificationStream } from "../services/notificationService.js";
import { ApiError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const listQuerySchema = z.object({
  limit: z
    .preprocess((value) => (value === undefined ? undefined : Number(value)), z.number().int().min(1).max(100))
    .optional()
});

export async function handleListNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const { limit } = listQuerySchema.parse(req.query ?? {});

    const normalizedUserId = userId.toLowerCase();

    const notifications = await NotificationModel.find({ userId: normalizedUserId })
      .sort({ createdAt: -1 })
      .limit(limit ?? 50);

    res.json({
      notifications: notifications.map((notification) => ({
        id: notification.id,
        event: notification.event,
        payload: notification.payload ?? null,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      }))
    });
  } catch (error) {
    handleControllerError("handleListNotifications", error, res);
  }
}

export async function handleNotificationStream(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const normalizedUserId = userId.toLowerCase();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const recent = await NotificationModel.find({ userId: normalizedUserId }).sort({ createdAt: -1 }).limit(10);
    if (recent.length) {
      const payload = recent
        .map((notification) => ({
          id: notification.id,
          event: notification.event,
          payload: notification.payload ?? null,
          isRead: notification.isRead,
          createdAt: notification.createdAt
        }))
        .reverse();
      res.write(`event: init\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } else {
      res.write(": heartbeat\n\n");
    }

    registerNotificationStream(normalizedUserId, req, res);
  } catch (error) {
    handleControllerError("handleNotificationStream", error, res);
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
