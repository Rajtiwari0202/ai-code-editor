# Product Plan

This plan turns Forge Editor from a polished frontend prototype into a deployable AI code editor.

## Phase 1: Frontend Foundation

Status: complete in this pass.

- Build the core IDE shell.
- Establish product identity and visual system.
- Document architecture and deployment path.
- Verify lint and production build.

## Phase 2: Real Editor State

Status: partially complete.

- Replace mock file data with a typed workspace model. Complete.
- Add file tree interactions: open, close, search, and dirty state. Complete.
- Add a real code editor surface with Monaco. Complete.
- Add file rename/create/delete actions. Not started.
- Persist layout state in local storage. Not started.
- Add responsive fallbacks for small screens.

## Phase 3: Local Workspace Agent

Status: contract started.

- Define local agent capabilities and approval boundaries. Complete.
- Add server route contracts for plan, patch proposal, and verification filtering. Complete.
- Create a separate Node process for privileged workspace operations.
- Implement safe file reads with ignore-file support.
- Implement patch application with preview and rollback.
- Add command execution with allowlisted scripts.
- Stream progress and logs back to the UI.

## Phase 4: AI Planning and Patching

- Add provider abstraction for model calls.
- Create structured prompts for planning, patching, review, and docs.
- Store every AI action with context files, prompt version, model, patch, and verification result.
- Add secret redaction before prompt assembly.
- Require user approval before writes and shell commands.

## Phase 5: Verification and Review

- Detect package manager and available scripts.
- Run lint, typecheck, test, and build where available.
- Attach findings to changed files.
- Generate concise PR summaries.
- Add failure recovery prompts that use command output as context.

## Phase 6: Deployment

- Deploy the web UI to Vercel.
- Package the local agent separately for desktop/local use.
- Add environment variable documentation.
- Add analytics only after privacy expectations are explicit.

## Definition of Done

The project is ready for public release when a developer can:

- Open a local repository.
- Ask for a change.
- Review the plan.
- Apply a patch.
- Run verification.
- Understand exactly what changed and why.
- Deploy the web UI without exposing local secrets.
