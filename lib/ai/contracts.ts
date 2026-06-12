export type PlanRequest = {
  intent: string
  activeFile: string
  dirtyFiles: string[]
}

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

export type PatchProposalRequest = PlanRequest & {
  selectedStepIds?: string[]
}

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

export type VerifyRequest = {
  commands?: string[]
}

export type VerifyResponse = {
  allowedCommands: string[]
  queuedCommands: string[]
  blockedCommands: string[]
}
