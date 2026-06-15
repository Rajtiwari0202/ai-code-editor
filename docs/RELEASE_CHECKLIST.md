# Release Checklist

Use this checklist before publishing a production build of Forge Editor.

## Code Gates

- `npm run verify:release` passes locally with production-like environment values.
- `npm run validate:env` passes with production-like environment values.
- `npm run validate:env:strict` passes in the production host environment before launch.
- `npm run validate:docs` passes.
- `npm run validate:templates` passes.
- `npm run audit:prod` passes with no high or critical production dependency advisories.
- `npm run lint` passes.
- `npm run build` passes.
- `npm run smoke:prod` passes after `npm run build`.
- GitHub Actions CI passes on `main`.
- Protected API routes return JSON `401` responses instead of HTML redirects for unauthenticated fetches.
- Production responses keep `Cross-Origin-Opener-Policy: same-origin`.
- Production responses keep `Cross-Origin-Embedder-Policy: require-corp`.

## Environment

- `DATABASE_URL` points to the production MongoDB-compatible database.
- `AUTH_SECRET` is a long random value and is not reused from development.
- `NEXTAUTH_URL` matches the deployed origin exactly.
- GitHub OAuth callback URL is configured as `<production-origin>/api/auth/callback/github`.
- Google OAuth callback URL is configured as `<production-origin>/api/auth/callback/google`.
- `AI_PROVIDER` is configured deliberately. For hosted AI, `OPENAI_API_KEY` and `OPENAI_MODEL` are set server-side; for local AI, `OLLAMA_BASE_URL` and `OLLAMA_MODEL` are documented.
- No secret values are committed, logged in docs, or exposed through `NEXT_PUBLIC_*`.

## Product Smoke Test

- Public home page loads.
- Terms and privacy pages load from sign-in and footer links.
- OAuth sign-in starts and returns to the app.
- Dashboard loads only for authenticated users.
- A playground can be created from each starter category.
- Existing playground files persist after save and refresh.
- Monaco opens and edits files.
- WebContainer terminal boots.
- Preview loads for frontend templates.
- Backend templates start from the terminal.
- AI chat shows a clear answer or provider-unavailable state.
- Inline AI completion fails gracefully when the provider is offline.

## Launch Notes

- Add production screenshots after the hosted URL is live.
- Choose an open-source license before broad public redistribution.
- Record the deployed commit, operator, smoke-test result, and rollback plan in the operations runbook.
- Keep OAuth, database, and AI provider ownership documented for future maintenance.
