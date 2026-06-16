# Security Policy

Forge Editor is a browser-based IDE with OAuth sign-in, persisted project data, WebContainers, and server-side AI provider calls. Security reports should focus on protecting user accounts, project data, deployment secrets, and provider credentials.

## Supported Version

Security fixes target the `main` branch until a versioned release process is introduced.

## Reporting A Vulnerability

Please report security issues through GitHub private vulnerability reporting or a private GitHub security advisory for this repository. Do not open a public issue with exploit details, secrets, tokens, database URLs, or OAuth credentials.

Include:

- the affected route, component, or workflow;
- the impact and who can trigger it;
- reproduction steps using non-sensitive test data;
- any relevant request or response shape with secrets removed.

## Security Boundaries

- OAuth, database, and AI provider secrets must stay server-side and must not use `NEXT_PUBLIC_*`.
- Authenticated dashboard and playground reads/writes are scoped to the current user.
- Protected API routes should return JSON `401` responses to unauthenticated fetch clients.
- WebContainer execution runs in the browser sandbox and is not host shell access.
- Future host-file or command execution features must require explicit user approval and a constrained allowlist.

## Local And Deployment Checks

Before release, run:

```bash
npm run verify:release
```

The release verifier includes dependency audit, public routes, protected API auth behavior, and the cross-origin isolation headers required by WebContainers.

## Dependency Updates

Dependabot is configured for npm and GitHub Actions updates. Security fixes that resolve high or critical production dependency advisories should be prioritized before release. Major framework upgrades, especially Next.js and Prisma, should be handled as planned migrations with release verification and rollback notes.

## Static Analysis

CodeQL runs on pushes, pull requests, and a weekly schedule for JavaScript and TypeScript. Treat confirmed code scanning alerts as release-blocking when they affect authentication, project ownership, AI provider secrets, stored project data, or deployment boundaries.
