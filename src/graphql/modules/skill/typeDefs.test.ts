import { describe, expect, it } from "@jest/globals";
import { buildSchema } from "graphql";

import { skillTypeDefs } from "./typeDefs.js";

describe("skillTypeDefs", () => {
  const schema = buildSchema(skillTypeDefs);

  it("defines the Skill type with the expected fields", () => {
    const skillType = schema.getType("Skill");
    expect(skillType).toBeDefined();

    const fields = (skillType as any).getFields();
    expect(Object.keys(fields).sort()).toEqual(
      ["category", "id", "level", "name", "proficiency", "yearsOfExperience"].sort(),
    );
    expect(fields.id.type.toString()).toBe("ID!");
    expect(fields.name.type.toString()).toBe("String!");
    expect(fields.category.type.toString()).toBe("String!");
    expect(fields.level.type.toString()).toBe("String!");
    expect(fields.proficiency.type.toString()).toBe("Int!");
    expect(fields.yearsOfExperience.type.toString()).toBe("Int!");
  });

  it("exposes a non-null list of non-null Skills on Query.skills", () => {
    const queryFields = schema.getQueryType()!.getFields();
    expect(queryFields.skills.type.toString()).toBe("[Skill!]!");
  });

  it("defines addSkill, updateSkill, and deleteSkill mutations", () => {
    const mutationFields = schema.getMutationType()!.getFields();

    expect(mutationFields.addSkill.type.toString()).toBe("Skill!");
    expect(mutationFields.addSkill.args.map((arg) => arg.name).sort()).toEqual(
      ["category", "level", "name", "proficiency", "yearsOfExperience"].sort(),
    );

    expect(mutationFields.updateSkill.type.toString()).toBe("Skill!");
    const updateArgs = Object.fromEntries(
      mutationFields.updateSkill.args.map((arg) => [arg.name, arg.type.toString()]),
    );
    expect(updateArgs).toEqual({
      id: "ID!",
      name: "String",
      category: "String",
      level: "String",
      proficiency: "Int",
      yearsOfExperience: "Int",
    });

    expect(mutationFields.deleteSkill.type.toString()).toBe("Skill!");
    expect(mutationFields.deleteSkill.args.map((arg) => arg.name)).toEqual(["id"]);
  });
});
