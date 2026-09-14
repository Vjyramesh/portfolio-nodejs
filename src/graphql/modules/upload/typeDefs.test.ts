import { describe, expect, it } from "@jest/globals";
import { buildSchema } from "graphql";

import { uploadTypeDefs } from "./typeDefs.js";

describe("uploadTypeDefs", () => {
  const schema = buildSchema(uploadTypeDefs);

  it("defines the uploadImage mutation taking an Upload scalar", () => {
    expect(schema.getType("Upload")).toBeDefined();

    const mutationFields = schema.getMutationType()!.getFields();
    expect(mutationFields.uploadImage.type.toString()).toBe("String!");
    expect(mutationFields.uploadImage.args.map((arg) => [arg.name, arg.type.toString()])).toEqual(
      [["file", "Upload!"]],
    );
  });

  it("defines the deleteImage mutation", () => {
    const mutationFields = schema.getMutationType()!.getFields();

    expect(mutationFields.deleteImage.type.toString()).toBe("Boolean!");
    expect(
      mutationFields.deleteImage.args.map((arg) => [arg.name, arg.type.toString()]),
    ).toEqual([["url", "String!"]]);
  });

  it("defines the updateImage mutation taking the old url and a new Upload", () => {
    const mutationFields = schema.getMutationType()!.getFields();

    expect(mutationFields.updateImage.type.toString()).toBe("String!");
    expect(
      mutationFields.updateImage.args.map((arg) => [arg.name, arg.type.toString()]),
    ).toEqual([
      ["oldUrl", "String!"],
      ["file", "Upload!"],
    ]);
  });
});
