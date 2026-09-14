import { createSchema } from "graphql-yoga";

import { workResolvers } from "./resolvers.js";
import { workTypeDefs } from "./typeDefs.js";

export const workSchema = createSchema({
  typeDefs: workTypeDefs,
  resolvers: workResolvers,
});
