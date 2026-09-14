import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { GraphQLScalarType } from "graphql";

import { config } from "../../../config/env.js";

interface UploadedFile {
  name: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

const uploadScalar = new GraphQLScalarType({
  name: "Upload",
  description: "A file uploaded via the GraphQL multipart request spec.",
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: () => {
    throw new Error("Upload literals are not supported; upload files as a variable.");
  },
});

async function saveFile(file: UploadedFile): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const filename = `${randomUUID()}-${safeName}`;

  await mkdir(config.uploadsDir, { recursive: true });
  await writeFile(path.join(config.uploadsDir, filename), buffer);

  return `/uploads/${filename}`;
}

async function removeFile(url: string): Promise<boolean> {
  const filename = path.basename(url);

  try {
    await unlink(path.join(config.uploadsDir, filename));
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export const uploadResolvers = {
  Upload: uploadScalar,
  Mutation: {
    uploadImage: (_parent: unknown, args: { file: UploadedFile }) => saveFile(args.file),
    deleteImage: (_parent: unknown, args: { url: string }) => removeFile(args.url),
    updateImage: async (_parent: unknown, args: { oldUrl: string; file: UploadedFile }) => {
      await removeFile(args.oldUrl);
      return saveFile(args.file);
    },
  },
};
