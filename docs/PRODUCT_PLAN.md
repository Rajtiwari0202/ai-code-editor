# Product Plan

This plan tracks the path from the current full-stack web IDE foundation to a deployable, polished AI code editor.

## Phase 1: Stabilize The Existing Product

Status: complete.

- Merge local work with the real GitHub project history. Complete.
- Preserve the full remote app: auth, dashboard, playground, WebContainers, AI chat, and Prisma. Complete.
- Remove duplicate root route conflicts. Complete.
- Replace generated metadata and corrupted README copy. Complete.
- Make lint/build usable for deployment while surfacing legacy debt. Complete.
- Verify production build after merge. Complete.

## Phase 2: Product Polish

Status: in progress.

- Clean dashboard empty, loading, and error states. Project creation and mutation failures now surface toasts instead of silent success.
- Improve playground first-load UX while WebContainers boot. Started.
- Make AI chat states explicit: idle, thinking, provider unavailable, and filtered empty states. Complete.
- Tighten responsive behavior for dashboard and playground.
- Replace broken template/image references and add final Open Graph metadata. Complete.
- Keep bundled starters runnable through `npm run start`. Complete for React, Next.js, Express, Hono, Vue, and Angular.
- Add a template validation command. Complete.
- Add documentation link validation. Complete.
- Scope playground mutations to the authenticated owner. Complete.
- Remove nonfunctional dashboard actions before launch. Complete for repository import.
- Remove broken dashboard sidebar links and empty action icons. Complete.
- Add public terms and privacy pages for OAuth sign-in links. Complete.
- Keep file explorer create, delete, and rename operations synced with the live WebContainer filesystem. Complete.
- Prevent duplicate or invalid file and folder names inside the playground explorer. Complete.

## Phase 3: AI Layer Hardening

- Create a provider abstraction for Ollama and future hosted models. Complete for Ollama and OpenAI-compatible chat-completions providers.
- Add request validation for chat, completion, plan, patch, and verify endpoints. Complete.
- Add request timeouts and graceful provider-unavailable errors. Complete for chat/completion.
- Return non-sensitive provider/model metadata from chat responses. Complete.
- Prevent inline completion provider failures from becoming insertable code. Complete.
- Add real streaming support when the provider abstraction supports it.
- Add prompt templates with versioning.
- Add secret redaction before sending file context to a model.
- Store AI action metadata when persistence is appropriate.

## Phase 4: Reviewable Patch Workflow

- Expand `/api/plan`, `/api/patch`, and `/api/verify` beyond deterministic scaffolding.
- Show proposed diffs in the playground before applying changes.
- Require user approval before file mutations.
- Run verification through a constrained command allowlist. Queueing complete; execution pending.
- Attach command output to the assistant response.

## Phase 5: Deployment

Status: deployed on Vercel; OAuth and database-backed sign-in are verified. Production AI remains provider-configurable through hosted OpenAI-compatible credentials or local Ollama instructions.

- Provision database. Complete.
- Configure OAuth providers. Complete for GitHub and Google.
- Configure model provider or local-model instructions. Documented for Ollama and OpenAI-compatible providers.
- Add environment validation command. Complete.
- Add CI release gates for env validation, docs validation, template validation, production dependency audit, lint, and build. Complete.
- Declare Node.js and npm runtime requirements. Complete.
- Include runtime starter files in serverless output tracing. Complete.
- Add an automated production smoke check and public health endpoint. Complete, including protected API auth contracts and cross-origin isolation headers.
- Add release checklist, deployment docs, operations runbook, and GitHub contribution templates. Complete.
- Verify local production build and static public routes. Complete.
- Verify WebContainer browser requirements in production. Headers are deployed; browser smoke testing remains part of release operations.
- Deploy to Vercel or another Node-compatible host. Complete on Vercel.
- Add production screenshots after the hosted URL is live. Complete for public and sign-in surfaces.

## Definition Of Done

The project is ready for a public release when:

- `npm run lint` exits successfully.
- `npm run build` exits successfully.
- `npm run verify:release` exits successfully.
- Required environment variables are documented and validated.
- The app can authenticate a user.
- A user can create/open a playground.
- A user can edit files in Monaco.
- A user can run a template through WebContainers.
- AI chat/completion has clear success and failure states.
- README and docs match shipped behavior.
