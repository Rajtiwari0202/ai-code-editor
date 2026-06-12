"use client"

import {
  Activity,
  Bot,
  Braces,
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
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  SplitSquareHorizontal,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const files = [
  { name: "app/page.tsx", status: "modified", language: "tsx" },
  { name: "lib/ai/prompt-plan.ts", status: "new", language: "ts" },
  { name: "components/editor/shell.tsx", status: "clean", language: "tsx" },
  { name: "docs/architecture.md", status: "clean", language: "md" },
  { name: "package.json", status: "clean", language: "json" },
]

const codeLines = [
  "export async function createEditPlan(input: EditRequest) {",
  "  const repoMap = await workspace.index(input.scope)",
  "  const context = selectRelevantFiles(repoMap, input.intent)",
  "",
  "  return ai.plan({",
  "    model: settings.model,",
  "    system: prompts.engineerPersona,",
  "    context,",
  "    guardrails: ['small-diffs', 'tests-first', 'explain-risk'],",
  "  })",
  "}",
]

const assistantSteps = [
  {
    title: "Understand the change",
    detail: "Read touched files, package scripts, and neighboring patterns before proposing edits.",
    state: "done",
  },
  {
    title: "Patch with context",
    detail: "Generate narrow diffs and keep every edit attached to a reason and verification step.",
    state: "active",
  },
  {
    title: "Verify behavior",
    detail: "Run lint, type checks, focused tests, and summarize any residual risk.",
    state: "queued",
  },
]

const reviewItems = [
  { label: "Unsafe shell command blocked", value: "2", tone: "text-amber-600" },
  { label: "Tests inferred from changed files", value: "6", tone: "text-emerald-600" },
  { label: "Docs updates suggested", value: "3", tone: "text-sky-600" },
]

const terminalLines = [
  "$ npm run lint",
  "OK no eslint warnings",
  "$ npm run build",
  "Creating an optimized production build ...",
  "Route (app)                              Size     First Load JS",
  "+ /                                      18.2 kB        132 kB",
]

const activity = [
  "Indexed 47 source files in 1.8s",
  "Detected Next.js App Router project",
  "Prepared review for uncommitted changes",
  "Saved architecture notes to docs/",
]

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col">
        <TopBar />

        <section className="grid min-h-0 flex-1 grid-cols-1 border-t border-border lg:grid-cols-[260px_minmax(0,1fr)_360px]">
          <aside className="hidden border-r border-border bg-sidebar/70 lg:block">
            <Sidebar />
          </aside>

          <section className="flex min-w-0 flex-col">
            <EditorHeader />
            <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_230px]">
              <EditorPane />
              <BottomPanel />
            </div>
          </section>

          <aside className="border-t border-border bg-background lg:border-l lg:border-t-0">
            <AssistantPanel />
          </aside>
        </section>
      </div>
    </main>
  )
}

function TopBar() {
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
          <p className="truncate text-xs text-muted-foreground">
            Workspace: ai-code-editor
          </p>
        </div>
      </div>

      <div className="hidden min-w-0 flex-1 justify-center px-6 md:flex">
        <div className="flex h-8 w-full max-w-xl items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 text-sm text-muted-foreground">
          <Search className="size-4" />
          <span className="truncate">Search files, commands, prompts, and symbols</span>
          <kbd className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 text-[11px]">
            Ctrl K
          </kbd>
        </div>
      </div>

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

function Sidebar() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Files className="size-4 text-muted-foreground" />
          Explorer
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="New file">
          <Plus />
        </Button>
      </div>

      <div className="space-y-1 px-2 py-3">
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-muted">
          <ChevronDown className="size-3.5" />
          F:\ai_code_editor
        </button>
        <div className="space-y-0.5 pl-3">
          {files.map((file) => (
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              key={file.name}
            >
              <FileCode2 className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="text-[10px] uppercase text-muted-foreground">
                {file.status === "modified" ? "M" : file.status === "new" ? "A" : ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-border p-3">
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

function EditorHeader() {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border bg-background px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon-sm" aria-label="Toggle sidebar">
          <LayoutPanelLeft />
        </Button>
        <div className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1 text-sm">
          <FileCode2 className="size-4 text-muted-foreground" />
          <span className="truncate">lib/ai/prompt-plan.ts</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon-sm" aria-label="Split editor">
          <SplitSquareHorizontal />
        </Button>
        <Button variant="outline" size="sm">
          <Play data-icon="inline-start" />
          Run
        </Button>
      </div>
    </div>
  )
}

function EditorPane() {
  return (
    <div className="min-h-0 overflow-hidden bg-[linear-gradient(90deg,var(--muted)_1px,transparent_1px)] bg-[length:64px_64px]">
      <div className="h-full overflow-auto">
        <div className="mx-auto max-w-5xl px-3 py-5 sm:px-6">
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            {reviewItems.map((item) => (
              <div className="rounded-lg border border-border bg-background p-3" key={item.label}>
                <div className={`text-2xl font-semibold ${item.tone}`}>{item.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Braces className="size-4 text-muted-foreground" />
                prompt-plan.ts
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                guarded edit mode
              </div>
            </div>
            <pre className="overflow-x-auto p-0 text-sm leading-6">
              <code>
                {codeLines.map((line, index) => (
                  <div
                    className="grid grid-cols-[3rem_minmax(0,1fr)] border-b border-border/50 last:border-0"
                    key={`${line}-${index}`}
                  >
                    <span className="select-none bg-muted/30 px-3 text-right text-xs text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="px-4 font-mono text-[13px]">{line || " "}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

function BottomPanel() {
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
        {["Typecheck", "Lint", "Build"].map((task) => (
          <div className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm" key={task}>
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>{task}</span>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="changes" className="m-0 p-3 text-sm text-muted-foreground">
        4 files staged for the next implementation pass. Review summary is ready.
      </TabsContent>
    </Tabs>
  )
}

function AssistantPanel() {
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
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
          Refactor the prompt planning flow, keep diffs small, and explain the tests that prove it.
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
          <Workflow className="size-3.5" />
          Current plan
        </div>
        <div className="space-y-3">
          {assistantSteps.map((step) => (
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
            This workspace keeps AI output traceable: every patch is connected to files read,
            commands run, and the exact risk left for the developer to inspect.
          </p>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Button className="flex-1">
            <Zap data-icon="inline-start" />
            Generate patch
          </Button>
          <Button variant="outline" size="icon-lg" aria-label="Open run history">
            <Clock3 />
          </Button>
        </div>
      </div>
    </div>
  )
}

function StepIcon({ state }: { state: string }) {
  if (state === "done") {
    return <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
  }

  if (state === "active") {
    return <Sparkles className="mt-0.5 size-4 text-sky-600" />
  }

  return <Circle className="mt-1 size-3.5 text-muted-foreground" />
}
