export type FileStatus = "clean" | "modified" | "new"

export type WorkspaceFile = {
  path: string
  language: string
  status: FileStatus
  content: string
}

export type AssistantStepState = "done" | "active" | "queued"

export type AssistantStep = {
  title: string
  detail: string
  state: AssistantStepState
}

export type VerificationTask = {
  name: string
  command: string
  status: "passed" | "running" | "queued"
}

export const workspaceFiles: WorkspaceFile[] = [
  {
    path: "app/page.tsx",
    language: "typescript",
    status: "modified",
    content: `import { EditorWorkspace } from "@/components/editor/workspace"

export default function Home() {
  return <EditorWorkspace />
}
`,
  },
  {
    path: "lib/ai/prompt-plan.ts",
    language: "typescript",
    status: "new",
    content: `export type EditRequest = {
  intent: string
  scope: string[]
}

export async function createEditPlan(input: EditRequest) {
  const repoMap = await workspace.index(input.scope)
  const context = selectRelevantFiles(repoMap, input.intent)

  return ai.plan({
    model: settings.model,
    system: prompts.engineerPersona,
    context,
    guardrails: ["small-diffs", "tests-first", "explain-risk"],
  })
}
`,
  },
  {
    path: "components/editor/workspace.tsx",
    language: "typescript",
    status: "clean",
    content: `"use client"

export function EditorWorkspace() {
  return (
    <main>
      <p>The workspace owns editor state, tabs, verification, and assistant UI.</p>
    </main>
  )
}
`,
  },
  {
    path: "docs/ARCHITECTURE.md",
    language: "markdown",
    status: "clean",
    content: `# Architecture

Forge Editor separates the browser workspace from privileged local operations.

- The web app renders the editor and review surfaces.
- The local agent reads files, applies patches, and runs commands.
- The AI provider layer plans and patches with auditable context.
`,
  },
  {
    path: "package.json",
    language: "json",
    status: "clean",
    content: `{
  "name": "ai_code_editor",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "lint": "eslint",
    "build": "next build"
  }
}
`,
  },
]

export const assistantSteps: AssistantStep[] = [
  {
    title: "Understand the change",
    detail:
      "Read the active file, nearby architecture notes, package scripts, and open tabs before proposing edits.",
    state: "done",
  },
  {
    title: "Patch with context",
    detail:
      "Generate narrow diffs and keep every edit attached to a reason, changed file, and verification step.",
    state: "active",
  },
  {
    title: "Verify behavior",
    detail:
      "Run lint, type checks, focused tests, and summarize any residual risk before commit.",
    state: "queued",
  },
]

export const verificationTasks: VerificationTask[] = [
  { name: "Lint", command: "npm run lint", status: "passed" },
  { name: "Build", command: "npm run build", status: "passed" },
  { name: "Unit tests", command: "npm test", status: "queued" },
]

export function getFileName(path: string) {
  return path.split("/").pop() ?? path
}

export function getDirectory(path: string) {
  const parts = path.split("/")
  parts.pop()
  return parts.join("/") || "."
}
