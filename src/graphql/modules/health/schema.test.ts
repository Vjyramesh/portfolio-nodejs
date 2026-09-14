import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";
import { graphql, type GraphQLSchema } from "graphql";

const mockIsDatabaseConnected = jest.fn();

jest.unstable_mockModule("../../../config/env.js", () => ({
  config: { nodeEnv: "test" },
}));

jest.unstable_mockModule("../../../db/connection.js", () => ({
  isDatabaseConnected: mockIsDatabaseConnected,
}));

let healthSchema: GraphQLSchema;

beforeAll(async () => {
  ({ healthSchema } = await import("./schema.js"));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("healthSchema", () => {
  it("resolves the health query end to end", async () => {
    mockIsDatabaseConnected.mockReturnValue(true);

    const result = await graphql({
      schema: healthSchema,
      source: `
        query {
          health {
            status
            environment
            databaseConnected
          }
        }
      `,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.health).toEqual({
      status: "ok",
      environment: "test",
      databaseConnected: true,
    });
  });
});
