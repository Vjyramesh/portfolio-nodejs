import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";
import { graphql, type GraphQLSchema } from "graphql";

const mockPut = jest.fn<(pathname: string, body: Buffer, opts: unknown) => Promise<{ url: string }>>();
const mockDel = jest.fn<(url: string) => Promise<void>>();

jest.unstable_mockModule("@vercel/blob", () => ({
  put: mockPut,
  del: mockDel,
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
    mockPut.mockResolvedValue({ url: "https://blob.example.com/photo-abc123.png" });

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
    expect(mockPut).toHaveBeenCalledWith("photo.png", Buffer.from(new TextEncoder().encode("data")), {
      access: "public",
      addRandomSuffix: true,
    });
    expect(result.data?.uploadImage).toBe("https://blob.example.com/photo-abc123.png");
  });

  it("resolves the deleteImage mutation end to end", async () => {
    mockDel.mockResolvedValue(undefined);

    const result = await graphql({
      schema: uploadSchema,
      source: `
        mutation {
          deleteImage(url: "https://blob.example.com/photo-abc123.png")
        }
      `,
    });

    expect(result.errors).toBeUndefined();
    expect(mockDel).toHaveBeenCalledWith("https://blob.example.com/photo-abc123.png");
    expect(result.data?.deleteImage).toBe(true);
  });

  it("resolves the updateImage mutation end to end, deleting the old blob and saving the new one", async () => {
    mockDel.mockResolvedValue(undefined);
    mockPut.mockResolvedValue({ url: "https://blob.example.com/new-photo-xyz789.png" });

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
      variableValues: { oldUrl: "https://blob.example.com/old-photo-abc123.png", file },
    });

    expect(result.errors).toBeUndefined();
    expect(mockDel).toHaveBeenCalledWith("https://blob.example.com/old-photo-abc123.png");
    expect(mockPut).toHaveBeenCalledWith(
      "new-photo.png",
      Buffer.from(new TextEncoder().encode("data")),
      { access: "public", addRandomSuffix: true },
    );
    expect(result.data?.updateImage).toBe("https://blob.example.com/new-photo-xyz789.png");
  });
});
