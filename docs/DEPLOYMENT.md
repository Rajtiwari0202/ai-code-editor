# Deployment

Forge Editor has two deployment concerns: the web UI and the future local workspace agent.

## Web UI

The current app can be deployed as a standard Next.js project.

```bash
npm install
npm run lint
npm run build
```

If the build passes, deploy to Vercel or another Node-compatible host.

### Vercel

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Use the default Next.js framework settings.
4. Set environment variables only when real AI providers or backend services are added.
5. Deploy.

## Environment Variables

No environment variables are required for the current frontend prototype.

Future provider keys should be server-only:

```text
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
LOCAL_AGENT_URL=
```

Do not expose provider keys through `NEXT_PUBLIC_*`.

## Local Agent Deployment

The local agent should not be deployed as a normal public web server. It needs access to files and commands on the developer machine, so it should run as:

- a local Node service,
- a desktop companion process,
- or a CLI-launched background process.

The hosted UI should connect to it only after the user grants workspace access.

## Preflight Checklist

- `npm run lint` passes.
- `npm run build` passes.
- README and docs match the shipped behavior.
- Metadata no longer uses generated defaults.
- No secrets are committed.
- Future backend endpoints keep privileged operations server-side.
