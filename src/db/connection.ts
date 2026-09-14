import mongoose from "mongoose";

import { config } from "../config/env.js";

export async function connectToDatabase(): Promise<void> {
  await mongoose.connect(config.mongoUri, { dbName: config.mongoDbName });
}

export async function disconnectFromDatabase(): Promise<void> {
  await mongoose.disconnect();
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
