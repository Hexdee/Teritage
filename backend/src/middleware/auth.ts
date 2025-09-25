import { NextFunction, Request, Response } from "express";

import { getUserById } from "../services/authService.js";
import { verifyAccessToken } from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    const user = await getUserById(payload.sub);
    if (!user) {
      res.status(401).json({ message: "Invalid authentication token" });
      return;
    }

    req.userId = user.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid authentication token" });
  }
}
