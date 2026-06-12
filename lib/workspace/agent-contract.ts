export type WorkspaceAgentCapability =
  | "read-files"
  | "write-patches"
  | "run-commands"
  | "stream-logs"

export type WorkspaceAgentManifest = {
  name: string
  version: string
  capabilities: WorkspaceAgentCapability[]
  workspaceRoot: string
  requiresApprovalFor: WorkspaceAgentCapability[]
}

export const localAgentManifest: WorkspaceAgentManifest = {
  name: "Forge Local Agent",
  version: "0.1.0",
  capabilities: ["read-files", "write-patches", "run-commands", "stream-logs"],
  workspaceRoot: "user-selected",
  requiresApprovalFor: ["write-patches", "run-commands"],
}

export function canRunWithoutApproval(capability: WorkspaceAgentCapability) {
  return !localAgentManifest.requiresApprovalFor.includes(capability)
}
