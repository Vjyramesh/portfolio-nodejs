import { describe, expect, it } from "@jest/globals";

import { WorkModel } from "./Work.js";

function buildValidWork(overrides: Record<string, unknown> = {}) {
  return new WorkModel({
    title: "E-Commerce Platform",
    description: "A full-featured online store.",
    shortDescription: "Online store",
    image: "https://example.com/image.png",
    link: "https://example.com",
    github: "https://github.com/example/ecommerce",
    technologies: ["React", "TypeScript", "GraphQL", "Node.js", "MongoDB"],
    startDate: new Date("2023-06-01T00:00:00Z"),
    ...overrides,
  });
}

describe("Work model", () => {
  it("passes validation with all required fields present", () => {
    const work = buildValidWork();
    expect(work.validateSync()).toBeUndefined();
  });

  it.each([
    "title",
    "description",
    "shortDescription",
    "image",
    "link",
    "github",
    "startDate",
  ])("fails validation when %s is missing", (field) => {
    const work = buildValidWork({ [field]: undefined });
    const error = work.validateSync();
    expect(error?.errors[field]).toBeDefined();
  });

  it("fails validation when technologies is empty", () => {
    const work = buildValidWork({ technologies: [] });
    const error = work.validateSync();
    expect(error?.errors.technologies).toBeDefined();
  });

  it("passes validation without an endDate", () => {
    const work = buildValidWork();
    expect(work.endDate).toBeUndefined();
    expect(work.validateSync()).toBeUndefined();
  });

  it("accepts an endDate when provided", () => {
    const work = buildValidWork({ endDate: new Date("2024-01-31T00:00:00Z") });
    expect(work.validateSync()).toBeUndefined();
    expect(work.endDate).toEqual(new Date("2024-01-31T00:00:00Z"));
  });
});
