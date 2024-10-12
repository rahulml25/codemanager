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
export type TemplateKey = z.infer<typeof ProjectTemplates>;

const IdSchema = z.string().trim().length(36);
const ISODatetimeSchema = z
  .string()
  .min(1)
  .regex(
    /\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-](0[0-9]|1[0-4]):[0-5]\d)/,
    { message: "Not a valid ISO string date" },
  );

export const projectCreateSchema = z.object({
  name: z.string().trim().min(1),
  template: ProjectTemplates,
  path: z.string().trim().min(1),
  description: z.string().optional().default(""),
});

export const projectSchema = z
  .object({
    id: IdSchema,
    // _createdAt: z.string().min(1).datetime(),
    _createdAt: ISODatetimeSchema,
    _isRelocatable: z.boolean(),
  })
  .merge(projectCreateSchema);

export type Project = z.infer<typeof projectSchema>;
export type ProjectFieldsOnly = z.infer<typeof projectCreateSchema>;
