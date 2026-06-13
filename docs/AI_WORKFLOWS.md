# AI Workflows

Forge Editor keeps AI behavior reviewable. The current AI routes support chat, code completion, planning, patch proposals, and verification queueing, but they do not directly mutate files on the host machine.

## Routes

| Route | Purpose | Mutation behavior |
| --- | --- | --- |
| `POST /api/chat` | Project-aware coding conversation through the configured Ollama provider. | No file mutation. |
| `POST /api/code-completion` | Inline editor suggestions based on cursor context. | No file mutation. |
| `POST /api/plan` | Deterministic plan metadata for a requested change. | No file mutation. |
| `POST /api/patch` | Patch proposal metadata for approved plan steps. | No file mutation. |
| `POST /api/verify` | Splits requested commands into allowed and blocked queues. | No command execution yet. |

## Validation

AI and review workflow routes use shared Zod schemas in `lib/ai/contracts.ts`. Invalid JSON returns `400`, malformed request fields return `400`, and provider failures return graceful errors where a provider call is involved.

## Provider Behavior

The browser does not choose model credentials directly. Chat and completion requests go through server routes, and the server reads `OLLAMA_BASE_URL` and `OLLAMA_MODEL`. The chat response returns non-sensitive provider metadata (`provider` and `model`) so the transcript can show what answered without exposing secrets.

The current assistant panel supports:

- Idle suggestions for chat, review, fix, and optimize modes.
- Thinking states while the server request is in flight.
- Provider-unavailable messaging when Ollama cannot be reached.
- Search and type filters for existing transcript messages.
- JSON transcript export for local review.

Streaming UI is intentionally not exposed yet because the current `/api/chat` route returns a single JSON response.

Inline completion failures are not converted into code snippets. If the provider is unavailable, `/api/code-completion` returns an error response, Monaco clears any pending suggestion, and the AI menu shows the provider issue.

## Verification Allowlist

The verification route only queues commands that are already part of the project release workflow:

```text
npm run validate:env
npm run validate:templates
npm run lint
npm run build
```

Commands outside this list are reported as blocked. Execution is intentionally separate from queueing; a future local workspace agent should run approved commands and attach output after user approval.
