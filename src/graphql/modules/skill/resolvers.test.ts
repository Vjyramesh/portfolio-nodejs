import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";

const mockFind = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();

jest.unstable_mockModule("../../../models/skill/Skill.js", () => ({
  SkillModel: {
    find: mockFind,
    create: mockCreate,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findByIdAndDelete: mockFindByIdAndDelete,
  },
}));

let skillResolvers: (typeof import("./resolvers.js"))["skillResolvers"];

beforeAll(async () => {
  ({ skillResolvers } = await import("./resolvers.js"));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("skillResolvers", () => {
  it("Query.skills delegates to SkillModel.find", () => {
    const skills = [{ id: "1", name: "TypeScript" }];
    mockFind.mockReturnValue(skills);

    const result = skillResolvers.Query.skills();

    expect(mockFind).toHaveBeenCalledWith();
    expect(result).toBe(skills);
  });

  it("Mutation.addSkill delegates to SkillModel.create with the given args", () => {
    const args = {
      name: "TypeScript",
      category: "Backend",
      level: "Advanced",
      proficiency: 85,
      yearsOfExperience: 5,
    };
    const created = { id: "1", ...args };
    mockCreate.mockReturnValue(created);

    const result = skillResolvers.Mutation.addSkill(undefined, args);

    expect(mockCreate).toHaveBeenCalledWith(args);
    expect(result).toBe(created);
  });

  it("Mutation.updateSkill delegates to SkillModel.findByIdAndUpdate without the id in the update payload", () => {
    const updated = { id: "1", name: "Go" };
    mockFindByIdAndUpdate.mockReturnValue(updated);

    const result = skillResolvers.Mutation.updateSkill(undefined, {
      id: "1",
      name: "Go",
    });

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith("1", { name: "Go" }, { new: true });
    expect(result).toBe(updated);
  });

  it("Mutation.deleteSkill delegates to SkillModel.findByIdAndDelete", () => {
    const deleted = { id: "1", name: "TypeScript" };
    mockFindByIdAndDelete.mockReturnValue(deleted);

    const result = skillResolvers.Mutation.deleteSkill(undefined, { id: "1" });

    expect(mockFindByIdAndDelete).toHaveBeenCalledWith("1");
    expect(result).toBe(deleted);
  });
});
