import cors from "cors";
import express from "express";
import { createYoga } from "graphql-yoga";

import { config } from "./config/env.js";
import { connectToDatabase } from "./db/connection.js";
import { schema } from "./graphql/schema.js";

async function main() {
  await connectToDatabase();

  const app = express();

  app.use(cors({ origin: config.corsOrigins, credentials: true }));
  app.use("/uploads", express.static(config.uploadsDir));

  const yoga = createYoga({
    schema,
    graphqlEndpoint: "/graphql",
    graphiql: !config.isProd,
  });

  app.use("/graphql", yoga);

  app.get("/", (_req, res) => {
    res.json({ status: "ok", environment: config.nodeEnv });
  });

  app.listen(config.port, () => {
    console.log(`Server ready at http://localhost:${config.port} (env: ${config.nodeEnv})`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
