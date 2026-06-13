# Architecture

Forge Editor is a Next.js App Router web IDE. The repository now contains the full product skeleton: public landing routes, authentication, dashboard, playground editor, Monaco editing, WebContainers execution, terminal output, live preview, AI chat/completion endpoints, and safe planning API contracts.

## High-Level System

```text
Browser
  Public home
  Auth screens
  Dashboard
  Playground IDE
    File explorer
    Monaco editor
    WebContainer terminal
    Preview iframe
    AI chat sidebar

Next.js App
  Route groups
  Server actions
  API routes
  Auth integration
  Prisma data access

External/Local Services
  OAuth providers
  MongoDB-compatible database
  Ollama or local model provider
  WebContainers runtime in supported browsers
```

## Main Directories

```text
app/
  (root)/                  Public landing page and layout
  (auth)/                  Sign-in flow
  dashboard/               Authenticated project dashboard
  playground/[id]/         Main IDE experience
  api/auth/                NextAuth route
  api/chat/                AI chat endpoint
  api/code-completion/     Code completion endpoint
  api/template/            Template fetch endpoint
  api/plan/                Deterministic plan contract
  api/patch/               Patch proposal contract
  api/verify/              Verification allowlist contract

modules/
  auth/                    Auth actions, hooks, and user UI
  dashboard/               Project list, templates, repo add flow
  playground/              Editor, explorer, dialogs, project hooks
  webcontainers/           Terminal, preview, runtime bootstrapping
  ai-chat/                 Assistant sidebar

lib/
  db.ts                    Prisma client
  template.ts              Template helpers
  ai/                      Planning/patch contracts and Ollama client
  verification/            Command allowlist helpers
  workspace/               Local agent capability contract
```

## Runtime Flow

1. A user signs in through NextAuth.
2. Dashboard actions create or load a playground record.
3. The playground route loads template/project data.
4. The file explorer and Monaco editor manipulate the in-memory project tree.
5. WebContainers boot the project runtime inside the browser.
6. Terminal and preview panels connect to the WebContainer process.
7. AI chat/completion endpoints provide coding assistance.
8. Planning/patch/verify routes provide a safe contract for future reviewable edits.

## AI Boundaries

Forge Editor should keep AI actions reviewable:

- Prompt context should be explicit and scoped to selected project files.
- Patch generation should return proposals before file mutation.
- Verification commands should pass through an allowlist.
- Provider keys must stay server-side.
- Local model usage should be configurable and documented.
- Ollama calls use `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, and bounded request timeouts.

## Security Boundaries

- Browser code must not receive OAuth secrets, database credentials, or provider keys.
- WebContainer execution is browser-contained and should not be treated as host shell access.
- Future host-file access must run through a local agent with user approval.
- Destructive project actions should keep confirmation dialogs.
- API routes should validate request payloads before calling provider or database code.

## Current Engineering Debt

- The remote project contains legacy TypeScript lint debt, mostly `any`, `@ts-ignore`, unused symbols, and optional-chain non-null assertions. ESLint currently reports these as warnings so production builds can pass while debt remains visible.
- The AI provider layer has a first shared Ollama client, but hosted-provider adapters and richer model selection are still pending.
- Verification UI is still early; route contracts exist, but command execution is not implemented.
- Deployment requires real OAuth and database environment variables.
