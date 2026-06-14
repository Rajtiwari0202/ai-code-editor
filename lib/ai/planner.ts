import type {
  PatchProposalRequest,
  PatchProposalResponse,
  PlanRequest,
  PlanResponse,
} from "@/lib/ai/contracts"
import { allowedVerificationCommands } from "@/lib/verification/commands"

function uniqueSelectedSteps(request: PatchProposalRequest) {
  return Array.from(new Set(request.selectedStepIds ?? [])).filter(Boolean)
}

function createProposalPreview(request: PatchProposalRequest) {
  const selectedSteps = uniqueSelectedSteps(request)
  const stepText =
    selectedSteps.length > 0
      ? selectedSteps.map((stepId) => `# - ${stepId}`).join("\n")
      : "# - draft-small-patch"

  return [
    "--- change-request",
    "+++ patch-proposal",
    "@@",
    `# Target file: ${request.activeFile}`,
    `# Intent: ${request.intent}`,
    "# Selected plan steps:",
    stepText,
    "#",
    "# No file content is mutated by this API route.",
    "# The local workspace agent must produce and apply the final diff after approval.",
  ].join("\n")
}

export function createPlan(request: PlanRequest): PlanResponse {
  const dirtyFileText =
    request.dirtyFiles.length > 0
      ? request.dirtyFiles.join(", ")
      : "no currently dirty files"

  return {
    summary: `Plan for ${request.activeFile}: ${request.intent}`,
    contextFiles: [request.activeFile, ...request.dirtyFiles].filter(
      (path, index, paths) => paths.indexOf(path) === index
    ),
    steps: [
      {
        id: "read-context",
        title: "Read relevant context",
        detail: `Inspect ${request.activeFile} plus ${dirtyFileText} before producing changes.`,
        risk: "low",
      },
      {
        id: "draft-small-patch",
        title: "Draft a small patch",
        detail:
          "Keep the patch narrow, explain every changed file, and avoid unrelated formatting churn.",
        risk: "medium",
      },
      {
        id: "verify",
        title: "Verify before commit",
        detail: `Run ${allowedVerificationCommands.join(", ")} and attach results to the assistant summary.`,
        risk: "low",
      },
    ],
    verification: allowedVerificationCommands,
  }
}

export function createPatchProposal(
  request: PatchProposalRequest
): PatchProposalResponse {
  const selectedSteps = uniqueSelectedSteps(request)

  return {
    proposals: [
      {
        id: "patch-active-file",
        filePath: request.activeFile,
        title:
          selectedSteps.length > 0
            ? `Prepare ${selectedSteps.length} approved step${selectedSteps.length === 1 ? "" : "s"}`
            : "Prepare scoped edits for active file",
        diffPreview: createProposalPreview(request),
        requiresApproval: true,
      },
    ],
    safetyNote:
      "This endpoint only proposes patch metadata. File writes must be performed by the local workspace agent after user approval.",
  }
}
