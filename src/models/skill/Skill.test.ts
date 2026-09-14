import { describe, expect, it } from "@jest/globals";

import { SkillModel } from "./Skill.js";

function buildValidSkill(overrides: Record<string, unknown> = {}) {
  return new SkillModel({
    name: "TypeScript",
    category: "Backend",
    level: "Advanced",
    proficiency: 85,
    yearsOfExperience: 5,
    ...overrides,
  });
}

describe("Skill model", () => {
  it("passes validation with all required fields present", () => {
    const skill = buildValidSkill();
    expect(skill.validateSync()).toBeUndefined();
  });

  it.each(["name", "category", "level", "proficiency", "yearsOfExperience"])(
    "fails validation when %s is missing",
    (field) => {
      const skill = buildValidSkill({ [field]: undefined });
      const error = skill.validateSync();
      expect(error?.errors[field]).toBeDefined();
    },
  );

  it("fails validation when proficiency is below 1", () => {
    const skill = buildValidSkill({ proficiency: 0 });
    const error = skill.validateSync();
    expect(error?.errors.proficiency).toBeDefined();
  });

  it("fails validation when proficiency is above 100", () => {
    const skill = buildValidSkill({ proficiency: 101 });
    const error = skill.validateSync();
    expect(error?.errors.proficiency).toBeDefined();
  });

  it("fails validation when yearsOfExperience is negative", () => {
    const skill = buildValidSkill({ yearsOfExperience: -1 });
    const error = skill.validateSync();
    expect(error?.errors.yearsOfExperience).toBeDefined();
  });

  it("coerces a numeric-looking level into a string", () => {
    const skill = buildValidSkill({ level: 3 });
    expect(skill.validateSync()).toBeUndefined();
    expect(skill.level).toBe("3");
  });
});
