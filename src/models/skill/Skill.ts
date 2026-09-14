import { Schema, model, type InferSchemaType } from "mongoose";

const skillSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, required: true },
  proficiency: { type: Number, required: true, min: 1, max: 100 },
  yearsOfExperience: { type: Number, required: true, min: 0 },
});

export type Skill = InferSchemaType<typeof skillSchema>;

export const SkillModel = model("Skill", skillSchema);
