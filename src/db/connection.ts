import mongoose from "mongoose";

import { config } from "../config/env.js";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase(): Promise<void> {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(config.mongoUri, { dbName: config.mongoDbName });
  }

  try {
    await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  connectionPromise = null;
  await mongoose.disconnect();
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
