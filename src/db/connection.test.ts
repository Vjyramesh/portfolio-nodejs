import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";

const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockConnection = { readyState: 0 };

jest.unstable_mockModule("mongoose", () => ({
  default: {
    connect: mockConnect,
    disconnect: mockDisconnect,
    connection: mockConnection,
  },
}));

jest.unstable_mockModule("../config/env.js", () => ({
  config: { mongoUri: "mongodb://test-host:27017", mongoDbName: "test_db" },
}));

let connectToDatabase: (typeof import("./connection.js"))["connectToDatabase"];
let disconnectFromDatabase: (typeof import("./connection.js"))["disconnectFromDatabase"];
let isDatabaseConnected: (typeof import("./connection.js"))["isDatabaseConnected"];

beforeAll(async () => {
  ({ connectToDatabase, disconnectFromDatabase, isDatabaseConnected } = await import("./connection.js"));
});

afterEach(() => {
  jest.clearAllMocks();
  mockConnection.readyState = 0;
});

describe("connectToDatabase", () => {
  it("connects using the configured mongo uri and db name", async () => {
    await connectToDatabase();

    expect(mockConnect).toHaveBeenCalledWith("mongodb://test-host:27017", { dbName: "test_db" });
  });
});

describe("disconnectFromDatabase", () => {
  it("disconnects mongoose", async () => {
    await disconnectFromDatabase();

    expect(mockDisconnect).toHaveBeenCalledWith();
  });
});

describe("isDatabaseConnected", () => {
  it("returns true when mongoose readyState is 1 (connected)", () => {
    mockConnection.readyState = 1;

    expect(isDatabaseConnected()).toBe(true);
  });

  it("returns false when mongoose readyState is not 1", () => {
    mockConnection.readyState = 0;

    expect(isDatabaseConnected()).toBe(false);
  });
});
