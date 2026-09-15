import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";

const mockPut = jest.fn<(pathname: string, body: Buffer, opts: unknown) => Promise<{ url: string }>>();
const mockDel = jest.fn<(url: string) => Promise<void>>();

jest.unstable_mockModule("@vercel/blob", () => ({
  put: mockPut,
  del: mockDel,
}));

let uploadResolvers: (typeof import("./resolvers.js"))["uploadResolvers"];

beforeAll(async () => {
  ({ uploadResolvers } = await import("./resolvers.js"));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("uploadResolvers", () => {
  it("Mutation.uploadImage uploads the file to blob storage and returns its URL", async () => {
    const file = {
      name: "photo.png",
      arrayBuffer: jest
        .fn<() => Promise<ArrayBuffer>>()
        .mockResolvedValue(new TextEncoder().encode("data").buffer),
    };
    mockPut.mockResolvedValue({ url: "https://blob.example.com/photo-abc123.png" });

    const result = await uploadResolvers.Mutation.uploadImage(undefined, { file });

    expect(mockPut).toHaveBeenCalledWith("photo.png", Buffer.from(new TextEncoder().encode("data")), {
      access: "public",
      addRandomSuffix: true,
    });
    expect(result).toBe("https://blob.example.com/photo-abc123.png");
  });

  it("Mutation.uploadImage sanitizes unsafe characters in the file name", async () => {
    const file = {
      name: "my photo (1).png",
      arrayBuffer: jest.fn<() => Promise<ArrayBuffer>>().mockResolvedValue(new ArrayBuffer(0)),
    };
    mockPut.mockResolvedValue({ url: "https://blob.example.com/my_photo__1_-abc123.png" });

    await uploadResolvers.Mutation.uploadImage(undefined, { file });

    expect(mockPut).toHaveBeenCalledWith(
      "my_photo__1_.png",
      Buffer.from(new ArrayBuffer(0)),
      expect.anything(),
    );
  });

  it("Mutation.deleteImage removes the blob and returns true", async () => {
    mockDel.mockResolvedValue(undefined);

    const result = await uploadResolvers.Mutation.deleteImage(undefined, {
      url: "https://blob.example.com/photo-abc123.png",
    });

    expect(mockDel).toHaveBeenCalledWith("https://blob.example.com/photo-abc123.png");
    expect(result).toBe(true);
  });

  it("Mutation.deleteImage propagates unexpected errors", async () => {
    const error = new Error("network error");
    mockDel.mockRejectedValue(error);

    await expect(
      uploadResolvers.Mutation.deleteImage(undefined, { url: "https://blob.example.com/photo.png" }),
    ).rejects.toThrow("network error");
  });

  it("Mutation.updateImage deletes the old blob and uploads the new one, returning its URL", async () => {
    mockDel.mockResolvedValue(undefined);
    mockPut.mockResolvedValue({ url: "https://blob.example.com/new-photo-xyz789.png" });

    const file = {
      name: "new-photo.png",
      arrayBuffer: jest
        .fn<() => Promise<ArrayBuffer>>()
        .mockResolvedValue(new TextEncoder().encode("data").buffer),
    };

    const result = await uploadResolvers.Mutation.updateImage(undefined, {
      oldUrl: "https://blob.example.com/old-photo-abc123.png",
      file,
    });

    expect(mockDel).toHaveBeenCalledWith("https://blob.example.com/old-photo-abc123.png");
    expect(mockPut).toHaveBeenCalledWith(
      "new-photo.png",
      Buffer.from(new TextEncoder().encode("data")),
      { access: "public", addRandomSuffix: true },
    );
    expect(result).toBe("https://blob.example.com/new-photo-xyz789.png");
  });

  it("Mutation.updateImage propagates unexpected delete errors without uploading the new file", async () => {
    const error = new Error("network error");
    mockDel.mockRejectedValue(error);
    const file = {
      name: "new-photo.png",
      arrayBuffer: jest.fn<() => Promise<ArrayBuffer>>().mockResolvedValue(new ArrayBuffer(0)),
    };

    await expect(
      uploadResolvers.Mutation.updateImage(undefined, {
        oldUrl: "https://blob.example.com/old-photo.png",
        file,
      }),
    ).rejects.toThrow("network error");

    expect(mockPut).not.toHaveBeenCalled();
  });

  it("Upload scalar rejects inline literals in favor of variables", () => {
    expect(() => (uploadResolvers.Upload as any).parseLiteral()).toThrow(
      "Upload literals are not supported; upload files as a variable.",
    );
  });
});
