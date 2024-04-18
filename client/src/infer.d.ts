import z from "zod";
import { Project as P, ProjectTemplates } from "@/../../tslib/schema";

export type TemplateKey = z.infer<typeof ProjectTemplates>;
export type Project = P;
