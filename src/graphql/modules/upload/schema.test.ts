import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";
import { graphql, type GraphQLSchema } from "graphql";

const mockRandomUUID = jest.fn<() => string>();
const mockMkdir = jest.fn<(dir: string, opts: unknown) => Promise<void>>();
const mockWriteFile = jest.fn<(file: string, data: Buffer) => Promise<void>>();
const mockUnlink = jest.fn<(file: string) => Promise<void>>();

jest.unstable_mockModule("../../../config/env.js", () => ({
  config: { uploadsDir: "/tmp/uploads" },
}));

jest.unstable_mockModule("node:crypto", () => ({
  randomUUID: mockRandomUUID,
}));

jest.unstable_mockModule("node:fs/promises", () => ({
  mkdir: mockMkdir,
  writeFile: mockWriteFile,
  unlink: mockUnlink,
}));

let uploadSchema: GraphQLSchema;

beforeAll(async () => {
  ({ uploadSchema } = await import("./schema.js"));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("uploadSchema", () => {
  it("resolves the uploadImage mutation end to end and returns the file's URL", async () => {
    mockRandomUUID.mockReturnValue("uuid-1234");
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const file = {
      name: "photo.png",
      arrayBuffer: jest
        .fn<() => Promise<ArrayBuffer>>()
        .mockResolvedValue(new TextEncoder().encode("data").buffer),
    };

    const result = await graphql({
      schema: uploadSchema,
      source: `
        mutation UploadImage($file: Upload!) {
          uploadImage(file: $file)
        }
      `,
      variableValues: { file },
    });

    expect(result.errors).toBeUndefined();
    expect(mockWriteFile).toHaveBeenCalledWith(
      "/tmp/uploads/uuid-1234-photo.png",
      Buffer.from(new TextEncoder().encode("data")),
    );
    expect(result.data?.uploadImage).toBe("/uploads/uuid-1234-photo.png");
  });

  it("resolves the deleteImage mutation end to end", async () => {
    mockUnlink.mockResolvedValue(undefined);

    const result = await graphql({
      schema: uploadSchema,
      source: `
        mutation {
          deleteImage(url: "/uploads/uuid-1234-photo.png")
        }
      `,
    });

    expect(result.errors).toBeUndefined();
    expect(mockUnlink).toHaveBeenCalledWith("/tmp/uploads/uuid-1234-photo.png");
    expect(result.data?.deleteImage).toBe(true);
  });

  it("resolves deleteImage to false when the file is already gone", async () => {
    const enoent = Object.assign(new Error("not found"), { code: "ENOENT" });
    mockUnlink.mockRejectedValue(enoent);

    const result = await graphql({
      schema: uploadSchema,
      source: `
        mutation {
          deleteImage(url: "/uploads/missing.png")
        }
      `,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.deleteImage).toBe(false);
  });

  it("resolves the updateImage mutation end to end, deleting the old file and saving the new one", async () => {
    mockUnlink.mockResolvedValue(undefined);
    mockRandomUUID.mockReturnValue("uuid-9999");
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const file = {
      name: "new-photo.png",
      arrayBuffer: jest
        .fn<() => Promise<ArrayBuffer>>()
        .mockResolvedValue(new TextEncoder().encode("data").buffer),
    };

    const result = await graphql({
      schema: uploadSchema,
      source: `
        mutation UpdateImage($oldUrl: String!, $file: Upload!) {
          updateImage(oldUrl: $oldUrl, file: $file)
        }
      `,
      variableValues: { oldUrl: "/uploads/uuid-1234-old-photo.png", file },
    });

    expect(result.errors).toBeUndefined();
    expect(mockUnlink).toHaveBeenCalledWith("/tmp/uploads/uuid-1234-old-photo.png");
    expect(mockWriteFile).toHaveBeenCalledWith(
      "/tmp/uploads/uuid-9999-new-photo.png",
      Buffer.from(new TextEncoder().encode("data")),
    );
    expect(result.data?.updateImage).toBe("/uploads/uuid-9999-new-photo.png");
  });
});
