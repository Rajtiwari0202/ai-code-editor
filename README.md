# Forge Editor

Forge Editor is a browser-based AI code editor built with Next.js, Monaco Editor, WebContainers, NextAuth, Prisma, and local AI workflows. It gives developers a web IDE with project templates, file exploration, code editing, terminal execution, live preview, AI chat, and code completion.

The product direction is simple: keep AI useful, visible, and reviewable. The app should help a developer plan changes, edit code, run projects, and verify work without hiding important context or mutating code without approval.

## Features

- Authentication with NextAuth, Google, and GitHub providers.
- Dashboard for creating, opening, starring, and managing playground projects.
- Template-driven project creation for React, Next.js, Express, Hono, Vue, and Angular.
- Monaco-powered editor with syntax highlighting and AI completion hooks.
- File explorer with create, rename, delete, and folder management flows.
- WebContainers runtime for in-browser installs, commands, terminal sessions, and preview.
- AI chat assistant for project-aware code help.
- Theme provider with light and dark mode support.
- Safe planning API contracts for future patch generation and verification workflows.
- Prisma schema for persisted users, accounts, sessions, playgrounds, and templates.

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
| AI | Ollama/local model routes and planning contracts |

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

Fill in the required values:

```env
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
```

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local AI Setup

The AI completion flow is designed for local model providers such as Ollama.

```bash
ollama run codellama
```

You can swap the model in the API route implementation as the provider layer matures.

## Scripts

```bash
npm run dev      # Start development server
npm run lint     # Run ESLint
npm run build    # Build for production
npm run start    # Start production server
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Product Plan](./docs/PRODUCT_PLAN.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Contributing](./docs/CONTRIBUTING.md)

## Current Status

The project now has a real product foundation: authentication, dashboard, playground editor, WebContainers, terminal, preview, AI chat/completion routes, and planning APIs. The next engineering milestones are hardening the local AI provider layer, improving verification UX, reducing TypeScript lint debt, and preparing deployment secrets and database provisioning.

## Deployment

The Next.js app can deploy to Vercel or another Node-compatible host. WebContainers and OAuth require careful environment setup and browser compatibility checks. See [Deployment](./docs/DEPLOYMENT.md) before publishing.

## License

Add a license file before broad public release.
