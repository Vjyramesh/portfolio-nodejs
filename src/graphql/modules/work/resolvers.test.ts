import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";

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

let workResolvers: (typeof import("./resolvers.js"))["workResolvers"];

beforeAll(async () => {
  ({ workResolvers } = await import("./resolvers.js"));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("workResolvers", () => {
  it("Query.works delegates to WorkModel.find", () => {
    const works = [{ id: "1", title: "E-Commerce Platform" }];
    mockFind.mockReturnValue(works);

    const result = workResolvers.Query.works();

    expect(mockFind).toHaveBeenCalledWith();
    expect(result).toBe(works);
  });

  it("Mutation.addWork delegates to WorkModel.create, converting date strings to Dates", () => {
    const args = {
      title: "E-Commerce Platform",
      description: "A full-featured online store.",
      shortDescription: "Online store",
      image: "https://example.com/image.png",
      link: "https://example.com",
      github: "https://github.com/example/ecommerce",
      technologies: ["React", "TypeScript"],
      startDate: "2023-06-01T00:00:00.000Z",
      endDate: "2024-01-31T00:00:00.000Z",
    };
    const created = { id: "1", ...args };
    mockCreate.mockReturnValue(created);

    const result = workResolvers.Mutation.addWork(undefined, args);

    expect(mockCreate).toHaveBeenCalledWith({
      ...args,
      startDate: new Date(args.startDate),
      endDate: new Date(args.endDate),
    });
    expect(result).toBe(created);
  });

  it("Mutation.addWork omits endDate when none is given", () => {
    const args = {
      title: "E-Commerce Platform",
      description: "A full-featured online store.",
      shortDescription: "Online store",
      image: "https://example.com/image.png",
      link: "https://example.com",
      github: "https://github.com/example/ecommerce",
      technologies: ["React", "TypeScript"],
      startDate: "2023-06-01T00:00:00.000Z",
    };
    mockCreate.mockReturnValue({ id: "1", ...args });

    workResolvers.Mutation.addWork(undefined, args);

    expect(mockCreate).toHaveBeenCalledWith({
      ...args,
      startDate: new Date(args.startDate),
      endDate: undefined,
    });
  });

  it("Mutation.updateWork delegates to WorkModel.findByIdAndUpdate, converting date strings to Dates", () => {
    const updated = { id: "1", title: "Go" };
    mockFindByIdAndUpdate.mockReturnValue(updated);

    const result = workResolvers.Mutation.updateWork(undefined, {
      id: "1",
      title: "Go",
      startDate: "2023-06-01T00:00:00.000Z",
      endDate: "2024-01-31T00:00:00.000Z",
    });

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      "1",
      {
        title: "Go",
        startDate: new Date("2023-06-01T00:00:00.000Z"),
        endDate: new Date("2024-01-31T00:00:00.000Z"),
      },
      { new: true },
    );
    expect(result).toBe(updated);
  });

  it("Mutation.updateWork omits date fields that were not provided", () => {
    mockFindByIdAndUpdate.mockReturnValue({ id: "1" });

    workResolvers.Mutation.updateWork(undefined, { id: "1", title: "Go" });

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith("1", { title: "Go" }, { new: true });
  });

  it("Mutation.deleteWork delegates to WorkModel.findByIdAndDelete", () => {
    const deleted = { id: "1", title: "E-Commerce Platform" };
    mockFindByIdAndDelete.mockReturnValue(deleted);

    const result = workResolvers.Mutation.deleteWork(undefined, { id: "1" });

    expect(mockFindByIdAndDelete).toHaveBeenCalledWith("1");
    expect(result).toBe(deleted);
  });

  it("Work.startDate formats a Date as an ISO string", () => {
    const startDate = new Date("2023-06-01T00:00:00Z");
    expect(workResolvers.Work.startDate({ startDate })).toBe("2023-06-01T00:00:00.000Z");
  });

  it("Work.endDate formats a Date as an ISO string when present", () => {
    const endDate = new Date("2024-01-31T00:00:00Z");
    expect(workResolvers.Work.endDate({ endDate })).toBe("2024-01-31T00:00:00.000Z");
  });

  it("Work.endDate returns null when there is no end date", () => {
    expect(workResolvers.Work.endDate({ endDate: undefined })).toBeNull();
  });

  it("Work.createdAt and Work.updatedAt format Dates as ISO strings", () => {
    const createdAt = new Date("2024-01-15T10:30:00Z");
    const updatedAt = new Date("2024-09-14T15:45:00Z");

    expect(workResolvers.Work.createdAt({ createdAt })).toBe("2024-01-15T10:30:00.000Z");
    expect(workResolvers.Work.updatedAt({ updatedAt })).toBe("2024-09-14T15:45:00.000Z");
  });
});
