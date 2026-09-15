import { del, put } from "@vercel/blob";
import { GraphQLScalarType } from "graphql";

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

  const blob = await put(safeName, buffer, { access: "public", addRandomSuffix: true });

  return blob.url;
}

async function removeFile(url: string): Promise<boolean> {
  // del() is idempotent: it resolves even if the blob is already gone.
  await del(url);
  return true;
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
