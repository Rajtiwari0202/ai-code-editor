# Product Plan

This plan tracks the path from the current full-stack web IDE foundation to a deployable, polished AI code editor.

## Phase 1: Stabilize The Existing Product

Status: in progress.

- Merge local work with the real GitHub project history. Complete.
- Preserve the full remote app: auth, dashboard, playground, WebContainers, AI chat, and Prisma. Complete.
- Remove duplicate root route conflicts. Complete.
- Replace generated metadata and corrupted README copy. Complete.
- Make lint/build usable for deployment while surfacing legacy debt. Complete.
- Verify production build after merge. Complete.

## Phase 2: Product Polish

- Clean dashboard empty, loading, and error states.
- Improve playground first-load UX while WebContainers boot.
- Make AI chat states explicit: idle, thinking, streaming, error.
- Tighten responsive behavior for dashboard and playground.
- Replace any broken image references and add final Open Graph metadata.

## Phase 3: AI Layer Hardening

- Create a provider abstraction for Ollama and future hosted models. Started with shared Ollama client.
- Add request validation for chat and completion endpoints. Partially complete.
- Add request timeouts and graceful provider-unavailable errors. Complete for chat/completion.
- Add prompt templates with versioning.
- Add secret redaction before sending file context to a model.
- Store AI action metadata when persistence is appropriate.

## Phase 4: Reviewable Patch Workflow

- Expand `/api/plan`, `/api/patch`, and `/api/verify` beyond deterministic scaffolding.
- Show proposed diffs in the playground before applying changes.
- Require user approval before file mutations.
- Run verification through a constrained command allowlist.
- Attach command output to the assistant response.

## Phase 5: Deployment

- Provision database.
- Configure OAuth providers.
- Configure model provider or local-model instructions.
- Add environment validation command. Complete.
- Verify WebContainer browser requirements in production.
- Deploy to Vercel or another Node-compatible host.
- Add release checklist and screenshots.

## Definition Of Done

The project is ready for a public release when:

- `npm run lint` exits successfully.
- `npm run build` exits successfully.
- Required environment variables are documented and validated.
- The app can authenticate a user.
- A user can create/open a playground.
- A user can edit files in Monaco.
- A user can run a template through WebContainers.
- AI chat/completion has clear success and failure states.
- README and docs match shipped behavior.
