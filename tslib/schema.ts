import z from "zod";

export const ProjectTemplates = z.union([
  z.literal("normal"),
  z.literal("python"),
  z.literal("python_sep"),
  z.literal("nodejs"),
  z.literal("nodejs-ts"),
  z.literal("nextjs"),
  z.literal("rust"),
]);

export const projectCreateSchema = z.object({
  name: z.string().trim().min(1),
  template: ProjectTemplates,
  path: z.string().trim().min(1),
  description: z.string().optional().default(""),
});

const IdSchema = z.string().trim().length(24);

export const projectUpdateSchema = z
  .object({ _id: IdSchema })
  .merge(projectCreateSchema.partial());

export const projectSchema = z
  .object({ _id: IdSchema, _createdAt: z.string().min(1).datetime() })
  .merge(projectCreateSchema);

export type Project = z.infer<typeof projectSchema>;
export type ProjectFieldsOnly = z.infer<typeof projectCreateSchema>;
export type ProjectWithoutId = Omit<z.infer<typeof projectSchema>, "_id">;
