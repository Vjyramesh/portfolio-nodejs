import { WorkModel } from "../../../models/work/Work.js";

export const workResolvers = {
  Query: {
    works: () => WorkModel.find(),
  },
  Mutation: {
    addWork: (
      _parent: unknown,
      args: {
        title: string;
        description: string;
        shortDescription: string;
        image: string;
        link: string;
        github: string;
        technologies: string[];
        startDate: string;
        endDate?: string;
      },
    ) =>
      WorkModel.create({
        ...args,
        startDate: new Date(args.startDate),
        endDate: args.endDate ? new Date(args.endDate) : undefined,
      }),
    updateWork: (
      _parent: unknown,
      args: {
        id: string;
        title?: string;
        description?: string;
        shortDescription?: string;
        image?: string;
        link?: string;
        github?: string;
        technologies?: string[];
        startDate?: string;
        endDate?: string;
      },
    ) => {
      const { id, startDate, endDate, ...rest } = args;
      const update: Record<string, unknown> = { ...rest };
      if (startDate !== undefined) update.startDate = new Date(startDate);
      if (endDate !== undefined) update.endDate = new Date(endDate);

      return WorkModel.findByIdAndUpdate(id, update, { new: true });
    },
    deleteWork: (_parent: unknown, args: { id: string }) =>
      WorkModel.findByIdAndDelete(args.id),
  },
  Work: {
    startDate: (work: { startDate: Date }) => work.startDate.toISOString(),
    endDate: (work: { endDate?: Date }) => work.endDate?.toISOString() ?? null,
    createdAt: (work: { createdAt: Date }) => work.createdAt.toISOString(),
    updatedAt: (work: { updatedAt: Date }) => work.updatedAt.toISOString(),
  },
};
