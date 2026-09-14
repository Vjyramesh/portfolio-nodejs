import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";

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

let uploadResolvers: (typeof import("./resolvers.js"))["uploadResolvers"];

beforeAll(async () => {
  ({ uploadResolvers } = await import("./resolvers.js"));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("uploadResolvers", () => {
  it("Mutation.uploadImage writes the file to the uploads dir and returns its URL", async () => {
    const file = {
      name: "photo.png",
      arrayBuffer: jest
        .fn<() => Promise<ArrayBuffer>>()
        .mockResolvedValue(new TextEncoder().encode("data").buffer),
    };
    mockRandomUUID.mockReturnValue("uuid-1234");
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const result = await uploadResolvers.Mutation.uploadImage(undefined, { file });

    expect(mockMkdir).toHaveBeenCalledWith("/tmp/uploads", { recursive: true });
    expect(mockWriteFile).toHaveBeenCalledWith(
      "/tmp/uploads/uuid-1234-photo.png",
      Buffer.from(new TextEncoder().encode("data")),
    );
    expect(result).toBe("/uploads/uuid-1234-photo.png");
  });

  it("Mutation.uploadImage sanitizes unsafe characters in the file name", async () => {
    const file = {
      name: "my photo (1).png",
      arrayBuffer: jest.fn<() => Promise<ArrayBuffer>>().mockResolvedValue(new ArrayBuffer(0)),
    };
    mockRandomUUID.mockReturnValue("uuid-5678");
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const result = await uploadResolvers.Mutation.uploadImage(undefined, { file });

    expect(result).toBe("/uploads/uuid-5678-my_photo__1_.png");
  });

  it("Mutation.deleteImage removes the file from the uploads dir and returns true", async () => {
    mockUnlink.mockResolvedValue(undefined);

    const result = await uploadResolvers.Mutation.deleteImage(undefined, {
      url: "/uploads/uuid-1234-photo.png",
    });

    expect(mockUnlink).toHaveBeenCalledWith("/tmp/uploads/uuid-1234-photo.png");
    expect(result).toBe(true);
  });

  it("Mutation.deleteImage strips directory segments from the url to stay inside the uploads dir", async () => {
    mockUnlink.mockResolvedValue(undefined);

    await uploadResolvers.Mutation.deleteImage(undefined, {
      url: "/uploads/../../etc/passwd",
    });

    expect(mockUnlink).toHaveBeenCalledWith("/tmp/uploads/passwd");
  });

  it("Mutation.deleteImage returns false when the file does not exist", async () => {
    const enoent = Object.assign(new Error("not found"), { code: "ENOENT" });
    mockUnlink.mockRejectedValue(enoent);

    const result = await uploadResolvers.Mutation.deleteImage(undefined, {
      url: "/uploads/missing.png",
    });

    expect(result).toBe(false);
  });

  it("Mutation.deleteImage rethrows unexpected errors", async () => {
    const error = new Error("disk exploded");
    mockUnlink.mockRejectedValue(error);

    await expect(
      uploadResolvers.Mutation.deleteImage(undefined, { url: "/uploads/photo.png" }),
    ).rejects.toThrow("disk exploded");
  });

  it("Mutation.updateImage deletes the old file and writes the new one, returning its URL", async () => {
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

    const result = await uploadResolvers.Mutation.updateImage(undefined, {
      oldUrl: "/uploads/uuid-1234-old-photo.png",
      file,
    });

    expect(mockUnlink).toHaveBeenCalledWith("/tmp/uploads/uuid-1234-old-photo.png");
    expect(mockWriteFile).toHaveBeenCalledWith(
      "/tmp/uploads/uuid-9999-new-photo.png",
      Buffer.from(new TextEncoder().encode("data")),
    );
    expect(result).toBe("/uploads/uuid-9999-new-photo.png");
  });

  it("Mutation.updateImage still saves the new file when the old one is already gone", async () => {
    const enoent = Object.assign(new Error("not found"), { code: "ENOENT" });
    mockUnlink.mockRejectedValue(enoent);
    mockRandomUUID.mockReturnValue("uuid-9999");
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const file = {
      name: "new-photo.png",
      arrayBuffer: jest.fn<() => Promise<ArrayBuffer>>().mockResolvedValue(new ArrayBuffer(0)),
    };

    const result = await uploadResolvers.Mutation.updateImage(undefined, {
      oldUrl: "/uploads/missing.png",
      file,
    });

    expect(result).toBe("/uploads/uuid-9999-new-photo.png");
  });

  it("Mutation.updateImage propagates unexpected delete errors without saving the new file", async () => {
    const error = new Error("disk exploded");
    mockUnlink.mockRejectedValue(error);
    const file = {
      name: "new-photo.png",
      arrayBuffer: jest.fn<() => Promise<ArrayBuffer>>().mockResolvedValue(new ArrayBuffer(0)),
    };

    await expect(
      uploadResolvers.Mutation.updateImage(undefined, {
        oldUrl: "/uploads/old-photo.png",
        file,
      }),
    ).rejects.toThrow("disk exploded");

    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("Upload scalar rejects inline literals in favor of variables", () => {
    expect(() => (uploadResolvers.Upload as any).parseLiteral()).toThrow(
      "Upload literals are not supported; upload files as a variable.",
    );
  });
});
