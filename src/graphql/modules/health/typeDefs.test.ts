import { describe, expect, it } from "@jest/globals";
import { buildSchema } from "graphql";

import { healthTypeDefs } from "./typeDefs.js";

describe("healthTypeDefs", () => {
  const schema = buildSchema(healthTypeDefs);

  it("defines the HealthStatus type with the expected fields", () => {
    const healthStatusType = schema.getType("HealthStatus");
    expect(healthStatusType).toBeDefined();

    const fields = (healthStatusType as any).getFields();
    expect(Object.keys(fields).sort()).toEqual(
      ["databaseConnected", "environment", "status"].sort(),
    );
    expect(fields.status.type.toString()).toBe("String!");
    expect(fields.environment.type.toString()).toBe("String!");
    expect(fields.databaseConnected.type.toString()).toBe("Boolean!");
  });

  it("exposes a non-null HealthStatus on Query.health", () => {
    const queryFields = schema.getQueryType()!.getFields();
    expect(queryFields.health.type.toString()).toBe("HealthStatus!");
  });
});
