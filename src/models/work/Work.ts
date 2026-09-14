import { Schema, model, type InferSchemaType } from "mongoose";

const workSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String, required: true },
    github: { type: String, required: true },
    technologies: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "technologies must contain at least one entry",
      },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
  },
  { timestamps: true },
);

export type Work = InferSchemaType<typeof workSchema>;

export const WorkModel = model("Work", workSchema);
