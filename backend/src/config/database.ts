import mongoose from "mongoose";

import { env } from "./env.js";

export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    mongoose.set("strictQuery", true);
    const connection = await mongoose.connect(env.mongoUri);
    return connection;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}
