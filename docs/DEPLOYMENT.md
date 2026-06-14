# Deployment

Forge Editor is a Next.js app with authentication, Prisma, WebContainers, and AI endpoints. Deploy it like a standard Next.js application, but prepare the environment carefully.

## Preflight

```bash
npm install
npm run validate:env
npm run validate:templates
npm run lint
npm run build
npm run smoke:prod
```

The validation, lint, build, and production smoke command should complete before deployment. `npm run smoke:prod` starts the built server, checks `/`, `/api/health`, `/terms`, `/privacy`, and verifies the cross-origin isolation headers required by WebContainers, then shuts the server down.

## Required Environment Variables

Create the same values locally in `.env.local` and in the production host:

```text
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
DATABASE_URL=
NEXTAUTH_URL=
OLLAMA_BASE_URL=
OLLAMA_MODEL=
```

Use the production URL for `NEXTAUTH_URL` after deployment.
`OLLAMA_BASE_URL` and `OLLAMA_MODEL` have defaults in code, but production AI behavior should be configured deliberately instead of relying on localhost from a hosted environment.

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

The current app includes local-model/Ollama-oriented routes. `OLLAMA_BASE_URL` defaults to `http://localhost:11434` and `OLLAMA_MODEL` defaults to `codellama:latest`. Hosted deployment should either:

- connect to a controlled server-side model provider, or
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

## Release Checklist

Use [Release Checklist](./RELEASE_CHECKLIST.md) for the complete handoff list.

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
