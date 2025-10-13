import { Request, Response } from "express";
import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import { env } from "../config/env.js";
import { NotificationModel } from "../models/Notification.js";
import { UserModel } from "../models/User.js";
import { sendEmail } from "../utils/email.js";

let io: SocketIOServer | undefined;

const sseClients = new Map<string, Set<Response>>();

export function initNotificationService(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: true,
      credentials: true
    },
    pingInterval: env.socketPingInterval,
    pingTimeout: env.socketPingTimeout
  });

  io.on("connection", (socket) => {
    socket.on("join", (userId: string) => {
      socket.join(userId);
    });
  });

  return io;
}

export async function emitNotification(userId: string, event: string, payload: unknown) {
  const normalizedUserId = userId.toLowerCase();
  const notification = await NotificationModel.create({
    userId: normalizedUserId,
    event,
    payload: payload ?? null
  });

  if (io) {
    io.to(normalizedUserId).emit(event, payload);
  }

  const clients = sseClients.get(String(notification.userId));
  if (clients?.size) {
    const data = JSON.stringify({
      id: notification.id,
      event: notification.event,
      payload: notification.payload,
      isRead: notification.isRead,
      createdAt: notification.createdAt
    });
    for (const res of clients) {
      res.write(`event: ${event}\n`);
      res.write(`data: ${data}\n\n`);
    }
  }
}

export function registerNotificationStream(userId: string, req: Request, res: Response) {
  const key = userId.toLowerCase();
  const existing = sseClients.get(key) ?? new Set<Response>();
  existing.add(res);
  sseClients.set(key, existing);

  req.on("close", () => {
    const clients = sseClients.get(key);
    if (!clients) {
      return;
    }
    clients.delete(res);
    if (clients.size === 0) {
      sseClients.delete(key);
    }
  });
}

export async function sendTransactionalEmail(userId: string, subject: string, html: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    return;
  }
  await sendEmail({ to: user.email, subject, html });
}
