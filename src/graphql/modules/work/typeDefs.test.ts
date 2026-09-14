import { describe, expect, it } from "@jest/globals";
import { buildSchema } from "graphql";

import { workTypeDefs } from "./typeDefs.js";

describe("workTypeDefs", () => {
  const schema = buildSchema(workTypeDefs);

  it("defines the Work type with the expected fields", () => {
    const workType = schema.getType("Work");
    expect(workType).toBeDefined();

    const fields = (workType as any).getFields();
    expect(Object.keys(fields).sort()).toEqual(
      [
        "createdAt",
        "description",
        "endDate",
        "github",
        "id",
        "image",
        "link",
        "shortDescription",
        "startDate",
        "technologies",
        "title",
        "updatedAt",
      ].sort(),
    );

    expect(fields.id.type.toString()).toBe("ID!");
    expect(fields.title.type.toString()).toBe("String!");
    expect(fields.description.type.toString()).toBe("String!");
    expect(fields.shortDescription.type.toString()).toBe("String!");
    expect(fields.image.type.toString()).toBe("String!");
    expect(fields.link.type.toString()).toBe("String!");
    expect(fields.github.type.toString()).toBe("String!");
    expect(fields.technologies.type.toString()).toBe("[String!]!");
    expect(fields.startDate.type.toString()).toBe("String!");
    expect(fields.endDate.type.toString()).toBe("String");
    expect(fields.createdAt.type.toString()).toBe("String!");
    expect(fields.updatedAt.type.toString()).toBe("String!");
  });

  it("exposes a non-null list of non-null Works on Query.works", () => {
    const queryFields = schema.getQueryType()!.getFields();
    expect(queryFields.works.type.toString()).toBe("[Work!]!");
  });

  it("defines the addWork mutation", () => {
    const mutationFields = schema.getMutationType()!.getFields();

    expect(mutationFields.addWork.type.toString()).toBe("Work!");
    const addWorkArgs = Object.fromEntries(
      mutationFields.addWork.args.map((arg) => [arg.name, arg.type.toString()]),
    );
    expect(addWorkArgs).toEqual({
      title: "String!",
      description: "String!",
      shortDescription: "String!",
      image: "String!",
      link: "String!",
      github: "String!",
      technologies: "[String!]!",
      startDate: "String!",
      endDate: "String",
    });
  });

  it("defines the updateWork mutation with an optional partial-update shape", () => {
    const mutationFields = schema.getMutationType()!.getFields();

    expect(mutationFields.updateWork.type.toString()).toBe("Work!");
    const updateWorkArgs = Object.fromEntries(
      mutationFields.updateWork.args.map((arg) => [arg.name, arg.type.toString()]),
    );
    expect(updateWorkArgs).toEqual({
      id: "ID!",
      title: "String",
      description: "String",
      shortDescription: "String",
      image: "String",
      link: "String",
      github: "String",
      technologies: "[String!]",
      startDate: "String",
      endDate: "String",
    });
  });

  it("defines the deleteWork mutation", () => {
    const mutationFields = schema.getMutationType()!.getFields();

    expect(mutationFields.deleteWork.type.toString()).toBe("Work!");
    expect(mutationFields.deleteWork.args.map((arg) => arg.name)).toEqual(["id"]);
  });
});
