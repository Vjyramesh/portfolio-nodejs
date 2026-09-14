import { SkillModel } from "../../../models/skill/Skill.js";

export const skillResolvers = {
  Query: {
    skills: () => SkillModel.find(),
  },
  Mutation: {
    addSkill: (
      _parent: unknown,
      args: {
        name: string;
        category: string;
        level: string;
        proficiency: number;
        yearsOfExperience: number;
      },
    ) => SkillModel.create(args),
    updateSkill: (
      _parent: unknown,
      args: {
        id: string;
        name?: string;
        category?: string;
        level?: string;
        proficiency?: number;
        yearsOfExperience?: number;
      },
    ) => {
      const { id, ...update } = args;
      return SkillModel.findByIdAndUpdate(id, update, { new: true });
    },
    deleteSkill: (_parent: unknown, args: { id: string }) =>
      SkillModel.findByIdAndDelete(args.id),
  },
};
