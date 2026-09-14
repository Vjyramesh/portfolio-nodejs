import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";

const mockIsDatabaseConnected = jest.fn();

jest.unstable_mockModule("../../../config/env.js", () => ({
  config: { nodeEnv: "test" },
}));

jest.unstable_mockModule("../../../db/connection.js", () => ({
  isDatabaseConnected: mockIsDatabaseConnected,
}));

let healthResolvers: (typeof import("./resolvers.js"))["healthResolvers"];

beforeAll(async () => {
  ({ healthResolvers } = await import("./resolvers.js"));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("healthResolvers", () => {
  it("reports an ok status with the current environment and db connectivity", () => {
    mockIsDatabaseConnected.mockReturnValue(true);

    const result = healthResolvers.Query.health();

    expect(result).toEqual({ status: "ok", environment: "test", databaseConnected: true });
  });

  it("reflects a disconnected database", () => {
    mockIsDatabaseConnected.mockReturnValue(false);

    const result = healthResolvers.Query.health();

    expect(result.databaseConnected).toBe(false);
  });
});
