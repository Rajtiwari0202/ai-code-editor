# Deployment

Forge Editor is a Next.js app with authentication, Prisma, WebContainers, and AI endpoints. Deploy it like a standard Next.js application, but prepare the environment carefully.

## Preflight

```bash
npm install
npm run validate:env
npm run lint
npm run build
```

Both commands should complete before deployment.

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

## Vercel Deployment

1. Push `main` to GitHub.
2. Import the repository in Vercel.
3. Select the Next.js framework preset.
4. Add all required environment variables.
5. Deploy.
6. Test sign-in, dashboard loading, playground creation, editor load, terminal boot, preview load, and AI endpoints.

## Database

The Prisma schema is configured for a MongoDB-compatible datasource through `DATABASE_URL`. Provision the database before first production use and make sure the connection string is not exposed to browser code.

## AI Provider

The current app includes local-model/Ollama-oriented routes. `OLLAMA_BASE_URL` defaults to `http://localhost:11434` and `OLLAMA_MODEL` defaults to `codellama:latest`. Hosted deployment should either:

- connect to a controlled server-side model provider, or
- document that AI completion requires a local development setup.

Do not expose model provider secrets through `NEXT_PUBLIC_*`.

## WebContainers

WebContainers run in supported browsers and may require cross-origin isolation headers depending on the runtime path. Before launch, verify the deployed playground in the target browsers.

## Release Checklist

- `npm run lint` passes.
- `npm run build` passes.
- `npm run validate:env` passes in the target environment.
- Metadata no longer uses generated defaults.
- README has no broken asset links.
- OAuth callback URLs match the deployed domain.
- Database connectivity works.
- Playground templates load.
- WebContainer terminal and preview work in production.
- AI routes fail gracefully when provider dependencies are unavailable.
