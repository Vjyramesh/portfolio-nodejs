import { createSchema } from "graphql-yoga";

import { healthResolvers } from "./modules/health/resolvers.js";
import { healthTypeDefs } from "./modules/health/typeDefs.js";
import { skillResolvers } from "./modules/skill/resolvers.js";
import { skillTypeDefs } from "./modules/skill/typeDefs.js";
import { uploadResolvers } from "./modules/upload/resolvers.js";
import { uploadTypeDefs } from "./modules/upload/typeDefs.js";
import { workResolvers } from "./modules/work/resolvers.js";
import { workTypeDefs } from "./modules/work/typeDefs.js";

export const schema = createSchema({
  typeDefs: [healthTypeDefs, skillTypeDefs, uploadTypeDefs, workTypeDefs],
  resolvers: [healthResolvers, skillResolvers, uploadResolvers, workResolvers],
});
