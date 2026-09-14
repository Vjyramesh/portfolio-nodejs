import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";
import { graphql, type GraphQLSchema } from "graphql";

const mockFind = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();

jest.unstable_mockModule("../../../models/work/Work.js", () => ({
  WorkModel: {
    find: mockFind,
    create: mockCreate,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findByIdAndDelete: mockFindByIdAndDelete,
  },
}));

let workSchema: GraphQLSchema;

beforeAll(async () => {
  ({ workSchema } = await import("./schema.js"));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("workSchema", () => {
  it("resolves the works query end to end, formatting dates as ISO strings", async () => {
    mockFind.mockReturnValue([
      {
        id: "1",
        title: "E-Commerce Platform",
        description: "A full-featured online store.",
        shortDescription: "Online store",
        image: "https://example.com/image.png",
        link: "https://example.com",
        github: "https://github.com/example/ecommerce",
        technologies: ["React", "TypeScript"],
        startDate: new Date("2023-06-01T00:00:00Z"),
        endDate: new Date("2024-01-31T00:00:00Z"),
        createdAt: new Date("2024-01-15T10:30:00Z"),
        updatedAt: new Date("2024-09-14T15:45:00Z"),
      },
    ]);

    const result = await graphql({
      schema: workSchema,
      source: `
        query {
          works {
            id
            title
            technologies
            startDate
            endDate
            createdAt
            updatedAt
          }
        }
      `,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.works).toEqual([
      {
        id: "1",
        title: "E-Commerce Platform",
        technologies: ["React", "TypeScript"],
        startDate: "2023-06-01T00:00:00.000Z",
        endDate: "2024-01-31T00:00:00.000Z",
        createdAt: "2024-01-15T10:30:00.000Z",
        updatedAt: "2024-09-14T15:45:00.000Z",
      },
    ]);
  });

  it("resolves the addWork mutation end to end", async () => {
    mockCreate.mockReturnValue({
      id: "2",
      title: "Portfolio Site",
      startDate: new Date("2024-02-01T00:00:00Z"),
    });

    const result = await graphql({
      schema: workSchema,
      source: `
        mutation {
          addWork(
            title: "Portfolio Site"
            description: "Personal portfolio."
            shortDescription: "Portfolio"
            image: "https://example.com/portfolio.png"
            link: "https://example.com"
            github: "https://github.com/example/portfolio"
            technologies: ["React", "GraphQL"]
            startDate: "2024-02-01T00:00:00.000Z"
          ) {
            id
            title
          }
        }
      `,
    });

    expect(result.errors).toBeUndefined();
    expect(mockCreate).toHaveBeenCalledWith({
      title: "Portfolio Site",
      description: "Personal portfolio.",
      shortDescription: "Portfolio",
      image: "https://example.com/portfolio.png",
      link: "https://example.com",
      github: "https://github.com/example/portfolio",
      technologies: ["React", "GraphQL"],
      startDate: new Date("2024-02-01T00:00:00.000Z"),
      endDate: undefined,
    });
    expect(result.data?.addWork).toEqual({ id: "2", title: "Portfolio Site" });
  });

  it("resolves the updateWork mutation end to end", async () => {
    mockFindByIdAndUpdate.mockReturnValue({ id: "2", title: "Renamed Portfolio" });

    const result = await graphql({
      schema: workSchema,
      source: `
        mutation {
          updateWork(id: "2", title: "Renamed Portfolio") {
            id
            title
          }
        }
      `,
    });

    expect(result.errors).toBeUndefined();
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      "2",
      { title: "Renamed Portfolio" },
      { new: true },
    );
    expect(result.data?.updateWork).toEqual({ id: "2", title: "Renamed Portfolio" });
  });

  it("resolves the deleteWork mutation end to end", async () => {
    mockFindByIdAndDelete.mockReturnValue({ id: "2", title: "Portfolio Site" });

    const result = await graphql({
      schema: workSchema,
      source: `
        mutation {
          deleteWork(id: "2") {
            id
            title
          }
        }
      `,
    });

    expect(result.errors).toBeUndefined();
    expect(mockFindByIdAndDelete).toHaveBeenCalledWith("2");
    expect(result.data?.deleteWork).toEqual({ id: "2", title: "Portfolio Site" });
  });
});
