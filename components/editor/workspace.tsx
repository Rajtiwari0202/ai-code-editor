"use client"

import dynamic from "next/dynamic"
import {
  Activity,
  Bot,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Code2,
  Command,
  FileCode2,
  Files,
  GitBranch,
  GitPullRequestArrow,
  LayoutPanelLeft,
  ListChecks,
  MessageSquareText,
  Play,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  SplitSquareHorizontal,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react"
import { useMemo, useState } from "react"

import {
  assistantSteps,
  getDirectory,
  getFileName,
  verificationTasks,
  workspaceFiles,
  type AssistantStepState,
  type WorkspaceFile,
} from "@/lib/workspace-model"
import type { PatchProposalResponse, PlanResponse } from "@/lib/ai/contracts"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Loading editor...
    </div>
  ),
})

const terminalLines = [
  "$ npm run lint",
  "OK no eslint warnings",
  "$ npm run build",
  "Creating an optimized production build ...",
  "+ /                                      prerendered as static content",
]

const activity = [
  "Indexed 47 source files in 1.8s",
  "Detected Next.js App Router project",
  "Prepared review for uncommitted changes",
  "Saved architecture notes to docs/",
]

export function EditorWorkspace() {
  const [files, setFiles] = useState(workspaceFiles)
  const [openPaths, setOpenPaths] = useState([
    "lib/ai/prompt-plan.ts",
    "components/editor/workspace.tsx",
    "docs/ARCHITECTURE.md",
  ])
  const [activePath, setActivePath] = useState(openPaths[0])
  const [query, setQuery] = useState("")
  const [assistantPrompt, setAssistantPrompt] = useState(
    "Refactor the prompt planning flow, keep diffs small, and explain the tests that prove it."
  )
  const [generatedPlan, setGeneratedPlan] = useState<PlanResponse | null>(null)
  const [patchProposal, setPatchProposal] = useState<PatchProposalResponse | null>(null)
  const [assistantStatus, setAssistantStatus] = useState<"idle" | "loading" | "error">("idle")

  const activeFile = files.find((file) => file.path === activePath) ?? files[0]
  const dirtyFiles = files.filter((file) => file.status === "modified")
  const filteredFiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return files
    }

    return files.filter((file) => file.path.toLowerCase().includes(normalizedQuery))
  }, [files, query])

  function openFile(path: string) {
    setActivePath(path)
    setOpenPaths((current) => (current.includes(path) ? current : [...current, path]))
  }

  function closeFile(path: string) {
    setOpenPaths((current) => {
      const next = current.filter((openPath) => openPath !== path)

      if (path === activePath) {
        setActivePath(next[0] ?? files[0]?.path ?? "")
      }

      return next
    })
  }

  function updateActiveFile(content: string | undefined) {
    if (content === undefined) {
      return
    }

    setFiles((current) =>
      current.map((file) =>
        file.path === activeFile.path
          ? {
              ...file,
              content,
              status: file.status === "new" ? "new" : "modified",
            }
          : file
      )
    )
  }

  function saveActiveFile() {
    setFiles((current) =>
      current.map((file) =>
        file.path === activeFile.path ? { ...file, status: "clean" } : file
      )
    )
  }

  function resetActiveFile() {
    const original = workspaceFiles.find((file) => file.path === activeFile.path)

    if (!original) {
      return
    }

    setFiles((current) =>
      current.map((file) =>
        file.path === activeFile.path
          ? { ...file, content: original.content, status: original.status }
          : file
      )
    )
  }

  async function generatePatchPlan() {
    setAssistantStatus("loading")
    setPatchProposal(null)

    try {
      const payload = {
        intent: assistantPrompt,
        activeFile: activeFile.path,
        dirtyFiles: dirtyFiles.map((file) => file.path),
      }

      const planResponse = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!planResponse.ok) {
        throw new Error("Unable to create plan")
      }

      const plan = (await planResponse.json()) as PlanResponse
      setGeneratedPlan(plan)

      const patchResponse = await fetch("/api/patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          selectedStepIds: plan.steps.map((step) => step.id),
        }),
      })

      if (!patchResponse.ok) {
        throw new Error("Unable to create patch proposal")
      }

      setPatchProposal((await patchResponse.json()) as PatchProposalResponse)
      setAssistantStatus("idle")
    } catch {
      setAssistantStatus("error")
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col">
        <TopBar query={query} setQuery={setQuery} />

        <section className="grid min-h-0 flex-1 grid-cols-1 border-t border-border lg:grid-cols-[268px_minmax(0,1fr)_368px]">
          <aside className="hidden min-h-0 border-r border-border bg-sidebar/70 lg:block">
            <Sidebar files={filteredFiles} activePath={activePath} openFile={openFile} />
          </aside>

          <section className="flex min-w-0 flex-col">
            <EditorHeader
              activeFile={activeFile}
              dirtyCount={dirtyFiles.length}
              onReset={resetActiveFile}
              onSave={saveActiveFile}
            />
            <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_230px]">
              <TabStrip
                activePath={activePath}
                closeFile={closeFile}
                files={files}
                openPaths={openPaths}
                setActivePath={setActivePath}
              />
              <EditorPane activeFile={activeFile} updateActiveFile={updateActiveFile} />
              <BottomPanel dirtyFiles={dirtyFiles} />
            </div>
          </section>

          <aside className="border-t border-border bg-background lg:min-h-0 lg:border-l lg:border-t-0">
            <AssistantPanel
              activeFile={activeFile}
              assistantStatus={assistantStatus}
              assistantPrompt={assistantPrompt}
              dirtyFiles={dirtyFiles}
              generatedPlan={generatedPlan}
              onGeneratePatchPlan={generatePatchPlan}
              patchProposal={patchProposal}
              setAssistantPrompt={setAssistantPrompt}
            />
          </aside>
        </section>
      </div>
    </main>
  )
}

function TopBar({
  query,
  setQuery,
}: {
  query: string
  setQuery: (query: string) => void
}) {
  return (
    <header className="flex h-14 items-center justify-between gap-3 border-border bg-background px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-primary text-primary-foreground">
          <Code2 className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold">Forge Editor</h1>
            <span className="hidden rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground sm:inline">
              local-first AI IDE
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">Workspace: ai-code-editor</p>
        </div>
      </div>

      <label className="hidden min-w-0 flex-1 justify-center px-6 md:flex">
        <span className="sr-only">Search workspace</span>
        <div className="flex h-8 w-full max-w-xl items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 text-sm text-muted-foreground">
          <Search className="size-4" />
          <input
            className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files, commands, prompts, and symbols"
            value={query}
          />
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px]">
            Ctrl K
          </kbd>
        </div>
      </label>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="hidden sm:inline-flex">
          <GitBranch data-icon="inline-start" />
          main
        </Button>
        <Button size="sm">
          <Sparkles data-icon="inline-start" />
          Ask AI
        </Button>
      </div>
    </header>
  )
}

function Sidebar({
  files,
  activePath,
  openFile,
}: {
  files: WorkspaceFile[]
  activePath: string
  openFile: (path: string) => void
}) {
  const directories = useMemo(
    () =>
      files.reduce<Record<string, WorkspaceFile[]>>((groups, file) => {
        const directory = getDirectory(file.path)
        groups[directory] = [...(groups[directory] ?? []), file]
        return groups
      }, {}),
    [files]
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Files className="size-4 text-muted-foreground" />
          Explorer
        </div>
        <span className="text-xs text-muted-foreground">{files.length} files</span>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-auto px-2 py-3">
        {Object.entries(directories).map(([directory, entries]) => (
          <div key={directory}>
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
              <ChevronDown className="size-3.5" />
              {directory}
            </div>
            <div className="space-y-0.5 pl-3">
              {entries.map((file) => (
                <button
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                    file.path === activePath && "bg-muted text-foreground"
                  )}
                  key={file.path}
                  onClick={() => openFile(file.path)}
                >
                  <FileCode2 className="size-4 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{getFileName(file.path)}</span>
                  <FileStatusBadge status={file.status} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Activity className="size-3.5" />
          Activity
        </div>
        <div className="space-y-2">
          {activity.map((item) => (
            <div className="flex gap-2 text-xs text-muted-foreground" key={item}>
              <Circle className="mt-1 size-2 fill-muted-foreground/50 text-transparent" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EditorHeader({
  activeFile,
  dirtyCount,
  onReset,
  onSave,
}: {
  activeFile: WorkspaceFile
  dirtyCount: number
  onReset: () => void
  onSave: () => void
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border bg-background px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon-sm" aria-label="Toggle sidebar">
          <LayoutPanelLeft />
        </Button>
        <div className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1 text-sm">
          <FileCode2 className="size-4 text-muted-foreground" />
          <span className="truncate">{activeFile.path}</span>
          <FileStatusBadge status={activeFile.status} />
        </div>
        {dirtyCount > 0 && (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {dirtyCount} unsaved file{dirtyCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon-sm" aria-label="Split editor">
          <SplitSquareHorizontal />
        </Button>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw data-icon="inline-start" />
          Reset
        </Button>
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save data-icon="inline-start" />
          Save
        </Button>
        <Button variant="outline" size="sm">
          <Play data-icon="inline-start" />
          Run
        </Button>
      </div>
    </div>
  )
}

function TabStrip({
  activePath,
  closeFile,
  files,
  openPaths,
  setActivePath,
}: {
  activePath: string
  closeFile: (path: string) => void
  files: WorkspaceFile[]
  openPaths: string[]
  setActivePath: (path: string) => void
}) {
  return (
    <div className="flex min-h-9 overflow-x-auto border-b border-border bg-muted/30">
      {openPaths.map((path) => {
        const file = files.find((entry) => entry.path === path)

        if (!file) {
          return null
        }

        return (
          <div
            className={cn(
              "flex h-9 min-w-44 items-center gap-2 border-r border-border px-3 text-sm",
              path === activePath ? "bg-background" : "text-muted-foreground"
            )}
            key={path}
          >
            <button
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              onClick={() => setActivePath(path)}
            >
              <FileCode2 className="size-3.5" />
              <span className="truncate">{getFileName(path)}</span>
              <FileStatusBadge status={file.status} />
            </button>
            <button
              aria-label={`Close ${path}`}
              className="rounded px-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => closeFile(path)}
            >
              x
            </button>
          </div>
        )
      })}
    </div>
  )
}

function EditorPane({
  activeFile,
  updateActiveFile,
}: {
  activeFile: WorkspaceFile
  updateActiveFile: (content: string | undefined) => void
}) {
  return (
    <div className="min-h-0 bg-[linear-gradient(90deg,var(--muted)_1px,transparent_1px)] bg-[length:64px_64px] p-3">
      <div className="h-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Code2 className="size-4 text-muted-foreground" />
            {getFileName(activeFile.path)}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            guarded edit mode
          </div>
        </div>
        <div className="h-[calc(100%-41px)]">
          <MonacoEditor
            height="100%"
            language={activeFile.language}
            onChange={updateActiveFile}
            options={{
              fontFamily:
                "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: 13,
              lineHeight: 22,
              minimap: { enabled: false },
              padding: { top: 14, bottom: 14 },
              renderLineHighlight: "line",
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              wordWrap: "on",
            }}
            path={activeFile.path}
            theme="vs"
            value={activeFile.content}
          />
        </div>
      </div>
    </div>
  )
}

function BottomPanel({ dirtyFiles }: { dirtyFiles: WorkspaceFile[] }) {
  return (
    <Tabs defaultValue="terminal" className="min-h-0 border-t border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <TabsList variant="line">
          <TabsTrigger value="terminal">
            <Terminal data-icon="inline-start" />
            Terminal
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ListChecks data-icon="inline-start" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="changes">
            <GitPullRequestArrow data-icon="inline-start" />
            Changes
          </TabsTrigger>
        </TabsList>
        <Button variant="ghost" size="icon-sm" aria-label="Panel settings">
          <Settings />
        </Button>
      </div>
      <TabsContent value="terminal" className="m-0 min-h-0 overflow-auto p-3">
        <div className="font-mono text-xs leading-6 text-muted-foreground">
          {terminalLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="tasks" className="m-0 grid gap-2 p-3 sm:grid-cols-3">
        {verificationTasks.map((task) => (
          <div className="rounded-lg border border-border p-3 text-sm" key={task.name}>
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={cn(
                  "size-4",
                  task.status === "passed" ? "text-emerald-600" : "text-muted-foreground"
                )}
              />
              <span>{task.name}</span>
            </div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">{task.command}</div>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="changes" className="m-0 p-3">
        <div className="grid gap-2 sm:grid-cols-2">
          {dirtyFiles.length === 0 ? (
            <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
              No unsaved changes.
            </div>
          ) : (
            dirtyFiles.map((file) => (
              <div className="rounded-lg border border-border p-3 text-sm" key={file.path}>
                <div className="font-medium">{file.path}</div>
                <div className="mt-1 text-xs text-muted-foreground">Ready for review</div>
              </div>
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}

function AssistantPanel({
  activeFile,
  assistantStatus,
  assistantPrompt,
  dirtyFiles,
  generatedPlan,
  onGeneratePatchPlan,
  patchProposal,
  setAssistantPrompt,
}: {
  activeFile: WorkspaceFile
  assistantStatus: "idle" | "loading" | "error"
  assistantPrompt: string
  dirtyFiles: WorkspaceFile[]
  generatedPlan: PlanResponse | null
  onGeneratePatchPlan: () => void
  patchProposal: PatchProposalResponse | null
  setAssistantPrompt: (prompt: string) => void
}) {
  return (
    <div className="flex h-full min-h-[520px] flex-col">
      <div className="border-b border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
              <Bot className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">AI Engineering Partner</h2>
              <p className="text-xs text-muted-foreground">Plans first, edits second</p>
            </div>
          </div>
          <Button variant="outline" size="icon-sm" aria-label="Assistant command menu">
            <Command />
          </Button>
        </div>
        <label className="block">
          <span className="sr-only">Assistant prompt</span>
          <textarea
            className="min-h-24 w-full resize-none rounded-lg border border-border bg-muted/40 p-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            onChange={(event) => setAssistantPrompt(event.target.value)}
            value={assistantPrompt}
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
          <Workflow className="size-3.5" />
          Current plan
        </div>
        <div className="space-y-3">
          {generatedPlan
            ? generatedPlan.steps.map((step, index) => (
                <div className="rounded-lg border border-border bg-card p-3" key={step.id}>
                  <div className="flex items-start gap-3">
                    <StepIcon state={index === 0 ? "done" : index === 1 ? "active" : "queued"} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium">{step.title}</h3>
                        <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                          {step.risk}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.detail}</p>
                    </div>
                  </div>
                </div>
              ))
            : assistantSteps.map((step) => (
                <div className="rounded-lg border border-border bg-card p-3" key={step.title}>
                  <div className="flex items-start gap-3">
                    <StepIcon state={step.state} />
                    <div>
                      <h3 className="text-sm font-medium">{step.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        <div className="mt-5 rounded-lg border border-border bg-card p-3">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <MessageSquareText className="size-4 text-muted-foreground" />
            Review note
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Active context includes {activeFile.path} and {dirtyFiles.length} unsaved file
            {dirtyFiles.length === 1 ? "" : "s"}. Future agent calls will attach plans,
            patches, and verification output here.
          </p>
        </div>

        {generatedPlan && (
          <div className="mt-3 rounded-lg border border-border bg-card p-3">
            <div className="mb-2 text-sm font-medium">Generated summary</div>
            <p className="text-sm leading-6 text-muted-foreground">{generatedPlan.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {generatedPlan.verification.map((command) => (
                <span
                  className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                  key={command}
                >
                  {command}
                </span>
              ))}
            </div>
          </div>
        )}

        {patchProposal && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="mb-2 text-sm font-medium text-amber-900">Patch proposal</div>
            <p className="text-sm leading-6 text-amber-800">{patchProposal.safetyNote}</p>
            <pre className="mt-3 overflow-auto rounded border border-amber-200 bg-white p-2 text-xs text-amber-900">
              {patchProposal.proposals[0]?.diffPreview}
            </pre>
          </div>
        )}

        {assistantStatus === "error" && (
          <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            Could not generate a plan. Check the local API route and try again.
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Button className="flex-1" disabled={assistantStatus === "loading"} onClick={onGeneratePatchPlan}>
            <Zap data-icon="inline-start" />
            {assistantStatus === "loading" ? "Planning..." : "Generate patch"}
          </Button>
          <Button variant="outline" size="icon-lg" aria-label="Open run history">
            <Clock3 />
          </Button>
        </div>
      </div>
    </div>
  )
}

function FileStatusBadge({ status }: { status: WorkspaceFile["status"] }) {
  if (status === "clean") {
    return null
  }

  return (
    <span
      className={cn(
        "rounded border px-1 py-0.5 text-[10px] font-medium uppercase",
        status === "new"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      )}
    >
      {status === "new" ? "A" : "M"}
    </span>
  )
}

function StepIcon({ state }: { state: AssistantStepState }) {
  if (state === "done") {
    return <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
  }

  if (state === "active") {
    return <Sparkles className="mt-0.5 size-4 text-sky-600" />
  }

  return <Circle className="mt-1 size-3.5 text-muted-foreground" />
}
