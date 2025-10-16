import mongoose from "mongoose";
import { Request, Response } from "express";
import { z } from "zod";

import { logger } from "../utils/logger.js";

const CLEARANCE_CODE = "HEXDEE_2025";

const clearDatabaseSchema = z.object({
  code: z.string().trim().min(1)
});

export async function handleClearDatabase(req: Request, res: Response): Promise<void> {
  try {
    const { code } = clearDatabaseSchema.parse(req.body ?? {});

    if (code !== CLEARANCE_CODE) {
      res.status(403).json({ message: "Invalid clearance code" });
      return;
    }

    await mongoose.connection.dropDatabase();
    res.json({ message: "Database cleared successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid request payload", errors: error.errors });
      return;
    }

    logger.error("[handleClearDatabase] Failed to clear database", error);
    res.status(500).json({ message: "Failed to clear database" });
  }
}
