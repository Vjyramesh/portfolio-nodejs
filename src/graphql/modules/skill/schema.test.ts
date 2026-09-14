import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";
import { graphql, type GraphQLSchema } from "graphql";

const mockFind = jest.fn();
const mockCreate = jest.fn();

jest.unstable_mockModule("../../../models/skill/Skill.js", () => ({
  SkillModel: {
    find: mockFind,
    create: mockCreate,
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

let skillSchema: GraphQLSchema;

beforeAll(async () => {
  ({ skillSchema } = await import("./schema.js"));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("skillSchema", () => {
  it("resolves the skills query end to end", async () => {
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
      schema: skillSchema,
      source: `
        query {
          skills {
            id
            name
            category
            level
            proficiency
            yearsOfExperience
          }
        }
      `,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.skills).toEqual([
      {
        id: "1",
        name: "TypeScript",
        category: "Backend",
        level: "Advanced",
        proficiency: 85,
        yearsOfExperience: 5,
      },
    ]);
  });

  it("resolves the addSkill mutation end to end", async () => {
    mockCreate.mockReturnValue({
      id: "2",
      name: "GraphQL",
      category: "Backend",
      level: "Intermediate",
      proficiency: 70,
      yearsOfExperience: 2,
    });

    const result = await graphql({
      schema: skillSchema,
      source: `
        mutation {
          addSkill(
            name: "GraphQL"
            category: "Backend"
            level: "Intermediate"
            proficiency: 70
            yearsOfExperience: 2
          ) {
            id
            name
          }
        }
      `,
    });

    expect(result.errors).toBeUndefined();
    expect(mockCreate).toHaveBeenCalledWith({
      name: "GraphQL",
      category: "Backend",
      level: "Intermediate",
      proficiency: 70,
      yearsOfExperience: 2,
    });
    expect(result.data?.addSkill).toEqual({ id: "2", name: "GraphQL" });
  });
});
