import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import { env } from "../config/env.js";
import { UserModel } from "../models/User.js";
import { sendEmail } from "../utils/email.js";

let io: SocketIOServer | undefined;

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
  if (io) {
    io.to(userId).emit(event, payload);
  }
}

export async function sendTransactionalEmail(userId: string, subject: string, html: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    return;
  }
  await sendEmail({ to: user.email, subject, html });
}
