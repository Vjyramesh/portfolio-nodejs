import { createSchema } from "graphql-yoga";

import { uploadResolvers } from "./resolvers.js";
import { uploadTypeDefs } from "./typeDefs.js";

export const uploadSchema = createSchema({
  typeDefs: uploadTypeDefs,
  resolvers: uploadResolvers,
});
