# Forge Editor

[![CI](https://github.com/Rajtiwari0202/ai-code-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/Rajtiwari0202/ai-code-editor/actions/workflows/ci.yml)

Forge Editor is a browser-based AI code editor built with Next.js, Monaco Editor, WebContainers, NextAuth, Prisma, and server-side AI workflows. It gives developers a web IDE with project templates, file exploration, code editing, terminal execution, live preview, AI chat, and code completion.

The product direction is simple: keep AI useful, visible, and reviewable. The app should help a developer plan changes, edit code, run projects, and verify work without hiding important context or mutating code without approval.

## Features

- Authentication with Auth.js/NextAuth, Google, and GitHub providers.
- Dashboard for creating, opening, starring, and managing playground projects.
- Template-driven project creation for React, Next.js, Express, Hono, Vue, and Angular.
- Monaco-powered editor with syntax highlighting and AI completion hooks.
- File explorer with create, rename, delete, and folder management flows.
- WebContainers runtime for in-browser installs, commands, terminal sessions, and preview.
- AI chat assistant for project-aware code help.
- Theme provider with light and dark mode support.
- Safe planning API contracts for future patch generation and verification workflows.
- Prisma schema for persisted users, OAuth accounts, playgrounds, templates, and JWT-backed sessions.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js App Router |
| Language | TypeScript |
| UI | Tailwind CSS, shadcn-style components, Radix UI |
| Auth | NextAuth |
| Database | Prisma with MongoDB-compatible connection |
| Editor | Monaco Editor |
| Runtime | WebContainers |
| Terminal | xterm.js |
| AI | Ollama and OpenAI-compatible provider routes, plus planning contracts |

## Project Structure

```text
app/
  (auth)/                  Sign-in route group
  (root)/                  Public home route group
  api/                     Auth, chat, completion, template, plan, patch, verify routes
  dashboard/               Authenticated dashboard
  playground/[id]/         Web IDE route
components/
  providers/               App providers
  ui/                      Shared UI primitives
docs/                      Architecture, product plan, deployment, contribution docs
lib/                       DB, templates, AI contracts, verification helpers
modules/
  ai-chat/                 AI assistant panel
  auth/                    Auth actions and components
  dashboard/               Dashboard actions and UI
  home/                    Public landing sections
  playground/              Editor, explorer, dialogs, hooks, utilities
  webcontainers/           Terminal, preview, WebContainer hooks
prisma/
  schema.prisma            Data model
templates/
  forge-starters/          Runnable starter projects loaded by the playground
```

## Getting Started

```bash
git clone https://github.com/Rajtiwari0202/ai-code-editor.git
cd ai-code-editor
npm install
```

Create `.env.local` from the example:

```bash
cp .env.example .env.local
```

Fill in the core required values:

```env
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
```

Then choose the AI provider posture for your environment:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=codellama:latest
```

For hosted AI, use the OpenAI-compatible mode instead:

```env
AI_PROVIDER=openai-compatible
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=
```

`OLLAMA_BASE_URL` and `OLLAMA_MODEL` are optional for basic app boot because the API routes have defaults. Configure them when you want local AI chat and completion to call a specific Ollama host/model.
For hosted AI, set `AI_PROVIDER=openai-compatible` and provide `OPENAI_API_KEY` plus `OPENAI_MODEL` on the server.

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## AI Provider Setup

The default AI flow is designed for local model providers such as Ollama.

```bash
ollama run codellama
```

`OLLAMA_BASE_URL` and `OLLAMA_MODEL` can be changed per environment. Hosted deployments can use an OpenAI-compatible chat-completions provider without exposing keys to the browser:

```env
AI_PROVIDER=openai-compatible
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
```

## Scripts

```bash
npm run dev      # Start development server
npm run lint     # Run ESLint
npm run build    # Build for production
npm run start    # Start production server
npm run smoke:prod  # Boot the production server and smoke test public routes, protected API auth, and isolation headers
npm run validate:env  # Check required deployment environment variables
npm run validate:templates  # Check bundled starter template contract
```

GitHub Actions runs the same release gates on `main` and pull requests.

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Product Plan](./docs/PRODUCT_PLAN.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Release Checklist](./docs/RELEASE_CHECKLIST.md)
- [Templates](./docs/TEMPLATES.md)
- [AI Workflows](./docs/AI_WORKFLOWS.md)
- [Contributing](./docs/CONTRIBUTING.md)
- Public pages: [Terms](./app/(root)/terms/page.tsx) and [Privacy](./app/(root)/privacy/page.tsx)

## Current Status

The project now has a real product foundation: authentication, dashboard, playground editor, persisted template files, bundled starter projects, WebContainers, terminal, preview, AI chat/completion routes, and planning APIs. Lint, production build, and environment validation are part of the release preflight. The remaining launch work is operational: provision MongoDB, configure OAuth callbacks, choose the production AI provider posture, and verify WebContainers in the deployed browser environment.

## Deployment

The Next.js app can deploy to Vercel or another Node-compatible host. WebContainers and OAuth require careful environment setup and browser compatibility checks. See [Deployment](./docs/DEPLOYMENT.md) before publishing.

## License

No open-source license has been selected yet. Choose and add a license file before broad public redistribution.
