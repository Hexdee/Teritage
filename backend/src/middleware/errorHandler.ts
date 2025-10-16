import { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";
import { ApiError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    if (env.nodeEnv !== "test") {
      logger.error("API error", err);
    }
    res.status(err.status).json({ message: err.message });
    return;
  }

  if (err instanceof Error) {
    if (env.nodeEnv !== "test") {
      logger.error("Unhandled error", err);
    }
    res.status(500).json({ message: err.message });
    return;
  }

  if (env.nodeEnv !== "test") {
    logger.error("Unknown error", err);
  }
  res.status(500).json({ message: "Unexpected error" });
}
