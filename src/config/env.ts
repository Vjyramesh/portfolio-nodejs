import path from "node:path";

import dotenv from "dotenv";

const nodeEnv = process.env.NODE_ENV ?? "development";
dotenv.config({ path: `.env.${nodeEnv}` });

export const config = {
  nodeEnv,
  isProd: nodeEnv === "production",
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017",
  mongoDbName: process.env.MONGODB_DB_NAME ?? "portfolio_dev",
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  uploadsDir: path.resolve(process.env.UPLOADS_DIR ?? "uploads"),
};
