import mongoose from "mongoose";

import { logger } from "../utils/logger.js";
import { env } from "./env.js";

export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    mongoose.set("strictQuery", true);
    const connection = await mongoose.connect(env.mongoUri);
    return connection;
  } catch (error) {
    logger.error("Failed to connect to MongoDB", error);
    throw error;
  }
}
