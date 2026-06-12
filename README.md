# Forge Editor

Forge Editor is a local-first AI code editor interface built with Next.js. It is designed around a simple principle: AI should help a developer understand, plan, patch, and verify code changes without hiding the reasoning or making the repository feel generated.

The current version is a polished product prototype for the editor workspace. It establishes the application shell, interaction model, visual language, and documentation needed before connecting real workspace indexing, model providers, file writes, and deployment.

## Highlights

- IDE-style workspace with explorer, editor, terminal, change review, and assistant panels.
- Monaco-powered code editor with open tabs, editable file buffers, search, dirty state, save, and reset controls.
- AI workflow model built around planning, guarded patching, and verification.
- Structured API routes for plan generation, patch proposals, and verification command filtering.
- Local-first product direction with explicit room for workspace indexing and secure command execution.
- Next.js App Router, React 19, Tailwind CSS 4, and shadcn/radix-nova UI primitives.
- Documentation for architecture, roadmap, deployment, and contribution standards.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/radix-nova components
- Lucide React icons
- Monaco Editor

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev      # Start the local development server
npm run lint     # Run ESLint
npm run build    # Create a production build
npm run start    # Start the production server
```

## Project Structure

```text
app/
  api/              Safe planning, patch proposal, and verification route contracts
  globals.css       Global Tailwind theme and design tokens
  layout.tsx        Root metadata, fonts, and document shell
  page.tsx          Home route that renders the editor workspace
components/editor/  Product-specific editor workspace components
components/ui/      Reusable shadcn/radix-nova primitives
docs/               Architecture, roadmap, and deployment notes
hooks/              Shared React hooks
lib/                Shared utilities, workspace model data, AI contracts, and verification helpers
public/             Static assets
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Product Plan](./docs/PRODUCT_PLAN.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Contributing](./docs/CONTRIBUTING.md)

## Current Status

This repository currently ships the frontend editor shell and safe API contracts for planning, patch proposals, and verification command filtering. It does not yet execute model calls, mutate local files, index a real repository, or run commands from the browser. Those capabilities should be added behind explicit server-side boundaries and permission checks, as described in the architecture and product plan.

## Deployment Target

The frontend can deploy cleanly to Vercel or any Node-compatible Next.js host. The future local workspace agent should run separately from the hosted web UI because it needs file-system and process access.

## License

Add a license before publishing the project publicly.
