import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Code2,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const workflow = [
  {
    icon: Boxes,
    title: "Start from real templates",
    copy: "Spin up React, Next.js, Express, Hono, Vue, or Angular projects with files ready to edit.",
  },
  {
    icon: Code2,
    title: "Edit with Monaco",
    copy: "Work inside a familiar code surface with syntax highlighting, tabs, file actions, and saved project state.",
  },
  {
    icon: TerminalSquare,
    title: "Run in the browser",
    copy: "Install dependencies, execute commands, and preview the app through WebContainers without leaving the workspace.",
  },
  {
    icon: ShieldCheck,
    title: "Keep AI reviewable",
    copy: "Use local AI chat and completion routes that keep suggestions visible before they become code.",
  },
];

const capabilities = [
  "Authenticated project dashboard",
  "Template creation and management",
  "File explorer with create, rename, and delete flows",
  "Live terminal and preview",
  "Local AI chat and code completion",
  "Deployment-ready environment validation",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative isolate overflow-hidden border-b">
        <Image
          src="/vibe-code-editor-thumbnail.svg"
          alt="Forge Editor workspace preview"
          fill
          priority
          className="object-cover opacity-[0.18] dark:opacity-[0.24]"
        />
        <div className="absolute inset-0 bg-background/90 dark:bg-background/85" />
        <div className="relative mx-auto flex min-h-[calc(100svh-8rem)] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-md border bg-background/80 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
              Browser IDE / local AI / WebContainers
            </p>
            <h1 className="text-5xl font-semibold tracking-normal text-foreground sm:text-7xl">
              Forge Editor
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              A focused AI code editor for creating projects, editing files,
              running commands, previewing apps, and reviewing AI suggestions
              before they touch your code.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11">
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11">
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="border-b bg-muted/25">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {workflow.map((item) => (
            <div key={item.title} className="rounded-lg border bg-background p-5">
              <item.icon className="mb-4 h-5 w-5 text-[#E93F3F]" />
              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-medium text-[#E93F3F]">Product surface</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal">
            Built around the workbench, not a landing-page promise.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Forge Editor keeps the main loop tight: choose a template, open the
            playground, edit files, ask for help, run the app, and verify the
            result. The AI layer supports the workflow without hiding context.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {capabilities.map((capability) => (
            <div key={capability} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <span className="text-sm leading-6">{capability}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
