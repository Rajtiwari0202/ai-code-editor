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

## Verification Allowlist

The verification route only queues commands that are already part of the project release workflow:

```text
npm run validate:env
npm run validate:templates
npm run lint
npm run build
```

Commands outside this list are reported as blocked. Execution is intentionally separate from queueing; a future local workspace agent should run approved commands and attach output after user approval.
