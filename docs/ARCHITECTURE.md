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
  Ollama or OpenAI-compatible model provider
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
  api/health/              Public deployment health check

modules/
  auth/                    Auth actions, hooks, and user UI
  dashboard/               Project list, template creation, metadata actions
  playground/              Editor, explorer, dialogs, project hooks
  webcontainers/           Terminal, preview, runtime bootstrapping
  ai-chat/                 Assistant sidebar

lib/
  db.ts                    Prisma client
  template.ts              Starter template path registry
  ai/                      Provider abstraction, planning/patch contracts, and request schemas
  verification/            Command allowlist helpers
  workspace/               Local agent capability contract

templates/
  forge-starters/          React, Next.js, Express, Hono, Vue, and Angular starters
```

## Runtime Flow

1. A user signs in through NextAuth.
2. Auth.js owns OAuth user and account persistence through the Prisma adapter.
3. Dashboard actions create or load a playground record.
4. The playground route loads saved template data or scans a starter from `templates/forge-starters`.
5. The file explorer and Monaco editor manipulate the in-memory project tree.
6. WebContainers boot the project runtime inside the browser.
7. Terminal and preview panels connect to the WebContainer process.
8. AI chat/completion endpoints provide coding assistance.
9. Planning/patch/verify routes provide a safe contract for future reviewable edits.

## AI Boundaries

Forge Editor should keep AI actions reviewable:

- Prompt context should be explicit and scoped to selected project files.
- AI routes validate JSON payloads through shared schemas before planning, proposing patches, queueing verification, or calling the provider.
- Patch generation should return proposals before file mutation.
- Verification commands should pass through an allowlist.
- Provider keys must stay server-side.
- Local model usage should be configurable and documented.
- AI provider calls use server-side environment variables and bounded request timeouts.

## Security Boundaries

- Browser code must not receive OAuth secrets, database credentials, or provider keys.
- OAuth account persistence should stay adapter-owned; avoid manually linking accounts by matching email addresses outside an authenticated session.
- WebContainer execution is browser-contained and should not be treated as host shell access.
- Playground reads and mutations are scoped to the authenticated owner before loading templates, saving files, editing metadata, deleting, duplicating, or toggling favorites.
- Dashboard project metadata is trimmed and validated in server actions before writes reach Prisma.
- Future host-file access must run through a local agent with user approval.
- Destructive project actions should keep confirmation dialogs.
- API routes should validate request payloads before calling provider or database code.

## Current Engineering Debt

- The AI provider layer supports local Ollama and hosted OpenAI-compatible chat-completions providers; richer in-app model selection is still pending.
- Verification UI is still early; route contracts exist, but command execution is not implemented.
- Deployment requires real OAuth and database environment variables in the target host.
- The patch workflow is still proposal-first; applying diffs from AI plans remains future work.
