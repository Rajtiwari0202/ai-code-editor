# Deployment

Forge Editor is a Next.js app with authentication, Prisma, WebContainers, and AI endpoints. Deploy it like a standard Next.js application, but prepare the environment carefully.

## Preflight

```bash
npm install
npm run verify:release
npm run validate:env:strict
```

Or run the same gates one by one:

```bash
npm run validate:env
npm run validate:docs
npm run validate:templates
npm run audit:prod
npm run lint
npm run build
npm run smoke:prod
```

The validation, lint, build, and production smoke command should complete before deployment. `npm run smoke:prod` starts the built server, checks `/`, `/api/health`, `/terms`, `/privacy`, `/robots.txt`, `/sitemap.xml`, verifies protected API routes return JSON `401` responses for unauthenticated requests, verifies the cross-origin isolation headers required by WebContainers, then shuts the server down.
`npm run validate:env` reads values from the shell, `.env`, and `.env.local`; shell-provided host values take precedence.

## Environment Variables

Create the same core values locally in `.env.local` and in the production host:

```text
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
DATABASE_URL=
NEXTAUTH_URL=
NEXT_PUBLIC_SITE_URL=
```

Use the production URL for `NEXTAUTH_URL` after deployment.
Set `NEXT_PUBLIC_SITE_URL` to the deployed public origin when it differs from `NEXTAUTH_URL`; it is used for canonical metadata, `robots.txt`, and `sitemap.xml`.

Choose one AI provider posture per environment. For local/default AI:

```text
AI_PROVIDER=ollama
OLLAMA_BASE_URL=
OLLAMA_MODEL=
```

For hosted OpenAI-compatible AI:

```text
AI_PROVIDER=openai-compatible
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_MODEL=
```

`AI_PROVIDER` defaults to `ollama`. `OLLAMA_BASE_URL` and `OLLAMA_MODEL` have defaults in code, but production AI behavior should be configured deliberately instead of relying on localhost from a hosted environment. For hosted AI, set `AI_PROVIDER=openai-compatible` and provide `OPENAI_API_KEY` plus `OPENAI_MODEL` in the deployment environment. `OPENAI_BASE_URL` defaults to `https://api.openai.com/v1` and can point at any compatible server-side endpoint.

OAuth callback URLs must match the deployed origin exactly:

```text
https://your-domain.example/api/auth/callback/github
https://your-domain.example/api/auth/callback/google
```

The Prisma schema follows the Auth.js adapter account shape. New OAuth sign-ins require an email address, and Google sign-ins also require a verified Google email claim.

## Vercel Deployment

1. Push `main` to GitHub.
2. Wait for GitHub Actions CI to pass on `main`.
3. Import the repository in Vercel.
4. Select the Next.js framework preset.
5. Add all required environment variables.
6. Deploy.
7. Test sign-in, dashboard loading, playground creation, editor load, terminal boot, preview load, and AI endpoints.

The template API reads starter files at runtime. `next.config.ts` explicitly includes `templates/forge-starters/**/*` in output tracing for `/api/template/[id]` so serverless deployments have those files available.

## Database

The Prisma schema is configured for a MongoDB-compatible datasource through `DATABASE_URL`. Provision the database before first production use and make sure the connection string is not exposed to browser code.

## AI Provider

The current app includes local-model/Ollama routes and an OpenAI-compatible hosted-provider mode. `OLLAMA_BASE_URL` defaults to `http://localhost:11434` and `OLLAMA_MODEL` defaults to `codellama:latest`. Hosted deployment should either:

- set `AI_PROVIDER=openai-compatible` and connect to a controlled server-side model provider, or
- document that AI completion requires a local development setup.

Do not expose model provider secrets through `NEXT_PUBLIC_*`.

## WebContainers

WebContainers require `SharedArrayBuffer`, HTTPS in production, and cross-origin isolation. `next.config.ts` sends these headers for all routes:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

The browser boot path also checks `window.crossOriginIsolated` before starting the runtime. Before launch, verify the deployed playground in the target browsers.

## Health Check

`GET /api/health` is public and returns a small JSON payload with `service`, `status`, and `timestamp`. Use it for deployment smoke checks and uptime monitoring.
Public metadata, `robots.txt`, and `sitemap.xml` derive their origin from `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_URL`, `AUTH_URL`, or `VERCEL_URL` in that order.

## Release Checklist

Use [Release Checklist](./RELEASE_CHECKLIST.md) for the complete handoff list and [Operations Runbook](./OPERATIONS.md) for post-deploy ownership, monitoring, rollback, and rotation steps.

- `npm run lint` passes.
- `npm run build` passes.
- `npm run validate:env` passes in the target environment.
- `npm run validate:templates` passes.
- `npm run smoke:prod` passes after `npm run build`.
- GitHub Actions CI passes on `main`.
- Metadata no longer uses generated defaults.
- Terms and privacy links resolve.
- README has no broken asset links.
- OAuth callback URLs match the deployed domain.
- Database connectivity works.
- Playground templates load.
- Each starter has a `package.json` with `npm run start`.
- WebContainer terminal and preview work in production.
- AI routes fail gracefully when provider dependencies are unavailable.
