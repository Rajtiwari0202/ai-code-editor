# Architecture

Forge Editor is organized as a Next.js App Router application with a frontend-first editor workspace. The first production milestone should keep the browser UI separate from any privileged local agent that can read files, write patches, or execute commands.

## Goals

- Provide an editor experience that feels deliberate, fast, and explainable.
- Keep AI-generated changes traceable to context, intent, patch, and verification.
- Avoid exposing file-system, shell, or model-provider secrets to browser code.
- Make local development useful before adding account systems or hosted collaboration.

## Current Implementation

```text
Browser UI
  app/page.tsx
    Workspace shell
    File explorer mock data
    Editor preview
    Terminal and task panels
    AI planning panel

Design System
  app/globals.css
    Tailwind theme tokens
  components/ui/*
    Shared primitives

Framework
  app/layout.tsx
    Fonts and metadata
```

The current app is intentionally static. It defines the product shape and interaction model without pretending to have workspace or AI execution implemented.

## Recommended Runtime Architecture

```text
Next.js Web App
  Renders editor UI
  Manages client state
  Sends explicit user actions to API routes or a local agent

Local Workspace Agent
  Reads repository files
  Builds file and symbol indexes
  Applies patches
  Runs allowed commands
  Streams command and model progress

AI Provider Layer
  Normalizes model requests
  Redacts secrets from prompts
  Stores prompt/response metadata for audit
  Supports provider swapping

Verification Layer
  Runs lint, typecheck, tests, and builds
  Maps results back to files and assistant messages
```

## Data Flow

1. User asks for a change in the assistant panel.
2. UI sends intent and selected workspace scope to the local agent.
3. Agent indexes relevant files and returns a proposed plan.
4. User approves or edits the plan.
5. Agent requests model output, validates the patch, and applies it.
6. Verification commands run in a constrained environment.
7. UI shows diffs, command output, and remaining risk.

## Security Boundaries

- Browser code must never receive raw API keys.
- Shell execution should require an allowlist and visible command preview.
- File writes should be patch-based, reviewable, and scoped to the active workspace.
- Prompt context should exclude ignored files, secrets, lockfile noise, and generated output unless explicitly requested.

## Suggested Future Modules

```text
lib/workspace/
  indexer.ts          File discovery, ignore handling, language summaries
  selection.ts        Context ranking for a user request

lib/ai/
  providers.ts        Model provider abstraction
  prompts.ts          System prompts and task templates
  patch-parser.ts     Structured patch validation

lib/verification/
  commands.ts         Allowed commands and runners
  results.ts          Normalized command output

app/api/
  plan/route.ts       Plan generation endpoint
  patch/route.ts      Patch creation endpoint
  verify/route.ts     Verification endpoint
```

## Design Principles

- Make reasoning visible.
- Prefer small patches over broad rewrites.
- Use existing repository patterns before adding abstractions.
- Treat verification as part of the feature, not an afterthought.
- Keep the UI dense and calm; this is a work surface, not a landing page.
