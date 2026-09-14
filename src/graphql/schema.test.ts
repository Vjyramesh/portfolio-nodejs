import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";
import { graphql, type GraphQLSchema } from "graphql";

const mockIsDatabaseConnected = jest.fn();
const mockFind = jest.fn();

jest.unstable_mockModule("../config/env.js", () => ({
  config: { nodeEnv: "test" },
}));

jest.unstable_mockModule("../db/connection.js", () => ({
  isDatabaseConnected: mockIsDatabaseConnected,
}));

jest.unstable_mockModule("../models/skill/Skill.js", () => ({
  SkillModel: {
    find: mockFind,
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

let schema: GraphQLSchema;

beforeAll(async () => {
  ({ schema } = await import("./schema.js"));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("schema", () => {
  it("merges the health and skill modules under a single Query type", async () => {
    mockIsDatabaseConnected.mockReturnValue(true);
    mockFind.mockReturnValue([
      {
        id: "1",
        name: "TypeScript",
        category: "Backend",
        level: "Advanced",
        proficiency: 85,
        yearsOfExperience: 5,
      },
    ]);

    const result = await graphql({
      schema,
      source: `
        query {
          health {
            status
          }
          skills {
            id
            name
          }
        }
      `,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      health: { status: "ok" },
      skills: [{ id: "1", name: "TypeScript" }],
    });
  });
});
