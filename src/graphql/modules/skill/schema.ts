import { createSchema } from "graphql-yoga";

import { skillResolvers } from "./resolvers.js";
import { skillTypeDefs } from "./typeDefs.js";

export const skillSchema = createSchema({
  typeDefs: skillTypeDefs,
  resolvers: skillResolvers,
});
