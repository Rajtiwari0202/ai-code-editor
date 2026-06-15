# Operations Runbook

Use this runbook after Forge Editor is deployed. It keeps production ownership explicit across auth, database, WebContainers, AI providers, and release recovery.

## Ownership Map

| Area | Owner Responsibility |
| --- | --- |
| Hosting | Keep the production URL, environment variables, build logs, and rollback controls accessible. |
| Database | Maintain backups, access control, connection string rotation, and storage monitoring. |
| OAuth | Keep GitHub and Google OAuth apps aligned with the production callback URLs. |
| AI Provider | Track provider keys, model names, usage limits, cost, and failure posture. |
| Security | Review dependency alerts, vulnerability reports, auth boundaries, and secret exposure risks. |

## Production Smoke Test

After every deploy:

1. Confirm GitHub Actions passed on `main`.
2. Confirm the host deployment finished from the expected commit SHA.
3. Open the public home page.
4. Open `/terms`, `/privacy`, `/robots.txt`, `/sitemap.xml`, and `/api/health`.
5. Start GitHub and Google OAuth sign-in.
6. Create a playground from at least one frontend template.
7. Open Monaco, edit a file, save, refresh, and confirm the change persists.
8. Boot the WebContainer terminal and preview.
9. Send an AI chat request and confirm either a useful answer or a clear provider-unavailable state.

## Monitoring

Minimum checks for launch:

- `GET /api/health` returns `200` and a JSON payload.
- Public routes respond under the expected production domain.
- Auth callback routes do not return provider configuration errors.
- Database connection errors stay below alert thresholds.
- AI provider requests track rate limits and server-side failures.
- WebContainer pages keep the `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers.

## Incident Response

For an outage or severe regression:

1. Capture the deployment commit SHA and failing route or workflow.
2. Check host logs, GitHub Actions, database status, OAuth provider status, and AI provider status.
3. If user data or secrets may be exposed, pause public communication until impact is understood.
4. Roll back to the last known green deployment if the regression is app-side.
5. Rotate affected credentials when a secret, token, database URL, or provider key is suspected exposed.
6. Open a follow-up issue with root cause, fix, verification, and prevention notes.

## Rollback

Keep rollback simple:

- Prefer the hosting provider's previous successful deployment rollback.
- Confirm `NEXTAUTH_URL`, OAuth callback URLs, and database variables still match the active domain.
- Run the production smoke test after rollback.
- Avoid schema or data changes that cannot be rolled back without a written migration plan.

## Secret Rotation

Rotate secrets when ownership changes, a developer machine is lost, a provider reports compromise, or logs accidentally expose sensitive values.

Priority order:

1. `AUTH_SECRET`
2. `DATABASE_URL`
3. `AUTH_GITHUB_SECRET`
4. `AUTH_GOOGLE_SECRET`
5. `OPENAI_API_KEY` or other hosted AI provider keys

After rotating, redeploy and verify OAuth sign-in, dashboard loading, playground persistence, and AI routes.

## Database Care

- Enable automated backups before launch.
- Keep at least one restore test documented for the production database provider.
- Restrict network access where the provider supports it.
- Never place database URLs in browser-visible variables or client logs.
- Review playground storage growth after launch; editor projects can expand quickly.

## AI Provider Care

- Set explicit usage limits or billing alerts before public launch.
- Keep provider keys server-side only.
- Document the production model name and fallback behavior.
- Treat prompt logs as potentially sensitive because project code may be included.

## Release Rhythm

Before each production release, use [Release Checklist](./RELEASE_CHECKLIST.md). After release, use this runbook's production smoke test and capture:

- deployed commit SHA,
- deployment URL,
- release time,
- operator,
- smoke-test result,
- known risks or follow-up issues.
