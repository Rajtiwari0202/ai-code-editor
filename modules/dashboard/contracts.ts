import { z } from "zod";

export const playgroundTemplateSchema = z.enum([
  "REACT",
  "NEXTJS",
  "EXPRESS",
  "VUE",
  "HONO",
  "ANGULAR",
]);

const projectTitleSchema = z
  .string()
  .trim()
  .min(1, "Project title is required")
  .max(120, "Project title must be 120 characters or fewer");

const optionalDescriptionSchema = z
  .string()
  .trim()
  .max(500, "Project description must be 500 characters or fewer")
  .optional()
  .transform((value) => (value ? value : undefined));

export const projectIdSchema = z
  .string()
  .trim()
  .min(1, "Project ID is required")
  .max(200, "Project ID is too long");

export const createPlaygroundSchema = z.object({
  title: projectTitleSchema,
  template: playgroundTemplateSchema,
  description: optionalDescriptionSchema,
});

export const editProjectSchema = z.object({
  title: projectTitleSchema,
  description: z
    .string()
    .trim()
    .max(500, "Project description must be 500 characters or fewer")
    .optional()
    .transform((value) => (value ? value : null)),
});

export type PlaygroundTemplate = z.infer<typeof playgroundTemplateSchema>;
export type CreatePlaygroundInput = z.input<typeof createPlaygroundSchema>;
export type EditProjectInput = z.input<typeof editProjectSchema>;
