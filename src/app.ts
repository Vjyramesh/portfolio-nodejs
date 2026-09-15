import cors from "cors";
import express, { type Express } from "express";
import { createYoga } from "graphql-yoga";

import { config } from "./config/env.js";
import { connectToDatabase, isDatabaseConnected } from "./db/connection.js";
import { schema } from "./graphql/schema.js";

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: config.corsOrigins, credentials: true }));

  const dbReady = connectToDatabase();
  dbReady.catch(() => {
    // Swallow here; awaited again in the /graphql middleware below, and
    // /health reports connectivity via isDatabaseConnected() regardless.
  });

  const yoga = createYoga({
    schema,
    graphqlEndpoint: "/graphql",
    graphiql: !config.isProd,
  });

  app.use("/graphql", async (_req, _res, next) => {
    try {
      await dbReady;
      next();
    } catch (error) {
      next(error);
    }
  });

  app.use("/graphql", yoga);

  app.get("/", (_req, res) => {
    res.json({ status: "ok", environment: config.nodeEnv });
  });

  app.get("/health", (_req, res) => {
    const databaseConnected = isDatabaseConnected();
    res.status(databaseConnected ? 200 : 503).json({
      status: databaseConnected ? "ok" : "unavailable",
      environment: config.nodeEnv,
      databaseConnected,
    });
  });

  return app;
}
