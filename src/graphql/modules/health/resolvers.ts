import { config } from "../../../config/env.js";
import { isDatabaseConnected } from "../../../db/connection.js";

export const healthResolvers = {
  Query: {
    health: () => ({
      status: "ok",
      environment: config.nodeEnv,
      databaseConnected: isDatabaseConnected(),
    }),
  },
};
