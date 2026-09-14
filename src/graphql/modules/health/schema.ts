import { createSchema } from "graphql-yoga";

import { healthResolvers } from "./resolvers.js";
import { healthTypeDefs } from "./typeDefs.js";

export const healthSchema = createSchema({
  typeDefs: healthTypeDefs,
  resolvers: healthResolvers,
});
