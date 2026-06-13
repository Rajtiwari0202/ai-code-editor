import { z } from "zod"

const filePathSchema = z.string().trim().min(1).max(500)

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(8000),
})

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(8000),
  history: z.array(chatMessageSchema).max(20).default([]),
})

export type ChatMessage = z.infer<typeof chatMessageSchema>
export type ChatRequest = z.infer<typeof chatRequestSchema>

export const codeSuggestionRequestSchema = z.object({
  fileContent: z.string().max(200000),
  cursorLine: z.number().int().nonnegative(),
  cursorColumn: z.number().int().nonnegative(),
  suggestionType: z.string().trim().min(1).max(80),
  fileName: filePathSchema.optional(),
})

export type CodeSuggestionRequest = z.infer<typeof codeSuggestionRequestSchema>

export const planRequestSchema = z.object({
  intent: z.string().trim().min(1).max(4000),
  activeFile: filePathSchema,
  dirtyFiles: z.array(filePathSchema).default([]),
})

export type PlanRequest = z.infer<typeof planRequestSchema>

export type PlanStep = {
  id: string
  title: string
  detail: string
  risk: "low" | "medium" | "high"
}

export type PlanResponse = {
  summary: string
  steps: PlanStep[]
  contextFiles: string[]
  verification: string[]
}

export const patchProposalRequestSchema = planRequestSchema.extend({
  selectedStepIds: z.array(z.string().trim().min(1).max(120)).optional(),
})

export type PatchProposalRequest = z.infer<typeof patchProposalRequestSchema>

export type PatchProposal = {
  id: string
  filePath: string
  title: string
  diffPreview: string
  requiresApproval: true
}

export type PatchProposalResponse = {
  proposals: PatchProposal[]
  safetyNote: string
}

export const verifyRequestSchema = z.object({
  commands: z.array(z.string().trim().min(1).max(200)).default([]),
})

export type VerifyRequest = z.infer<typeof verifyRequestSchema>

export type VerifyResponse = {
  allowedCommands: string[]
  queuedCommands: string[]
  blockedCommands: string[]
}
