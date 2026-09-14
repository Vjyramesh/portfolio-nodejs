import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockDotenvConfig = jest.fn();

jest.unstable_mockModule("dotenv", () => ({
  default: { config: mockDotenvConfig },
}));

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  jest.resetModules();
  mockDotenvConfig.mockClear();
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe("config", () => {
  it("falls back to development defaults when no env vars are set", async () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.MONGODB_URI;
    delete process.env.MONGODB_DB_NAME;
    delete process.env.CORS_ORIGINS;
    delete process.env.UPLOADS_DIR;

    const { config } = await import("./env.js");

    expect(mockDotenvConfig).toHaveBeenCalledWith({ path: ".env.development" });
    expect(config).toEqual({
      nodeEnv: "development",
      isProd: false,
      port: 4000,
      mongoUri: "mongodb://localhost:27017",
      mongoDbName: "portfolio_dev",
      corsOrigins: ["http://localhost:3000"],
      uploadsDir: path.resolve("uploads"),
    });
  });

  it("reads overrides from process.env", async () => {
    process.env.NODE_ENV = "production";
    process.env.PORT = "8080";
    process.env.MONGODB_URI = "mongodb://custom-host:27017";
    process.env.MONGODB_DB_NAME = "portfolio_prod";
    process.env.CORS_ORIGINS = "https://a.com, https://b.com";
    process.env.UPLOADS_DIR = "custom-uploads";

    const { config } = await import("./env.js");

    expect(mockDotenvConfig).toHaveBeenCalledWith({ path: ".env.production" });
    expect(config).toEqual({
      nodeEnv: "production",
      isProd: true,
      port: 8080,
      mongoUri: "mongodb://custom-host:27017",
      mongoDbName: "portfolio_prod",
      corsOrigins: ["https://a.com", "https://b.com"],
      uploadsDir: path.resolve("custom-uploads"),
    });
  });

  it("filters out empty entries from CORS_ORIGINS", async () => {
    process.env.CORS_ORIGINS = "https://a.com,, https://b.com,";

    const { config } = await import("./env.js");

    expect(config.corsOrigins).toEqual(["https://a.com", "https://b.com"]);
  });
});
