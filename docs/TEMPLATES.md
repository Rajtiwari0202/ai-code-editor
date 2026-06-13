# Starter Templates

Forge Editor loads starter projects from `templates/forge-starters` when a playground does not yet have saved file content.

## Template Contract

Every starter must:

- live under `templates/forge-starters/<template-name>`;
- include a root `package.json`;
- expose `npm run start`;
- bind development servers to `0.0.0.0` when a framework supports host configuration;
- avoid checked-in `node_modules`, build output, lock files, and environment files;
- keep first-run dependencies reasonable for WebContainers.

Run the contract check before changing or deploying templates:

```bash
npm run validate:templates
```

## Included Starters

| Playground template | Directory | Runtime command |
| --- | --- | --- |
| React | `templates/forge-starters/react-ts` | `npm run start` |
| Next.js | `templates/forge-starters/nextjs` | `npm run start` |
| Express | `templates/forge-starters/express` | `npm run start` |
| Hono | `templates/forge-starters/hono` | `npm run start` |
| Vue | `templates/forge-starters/vue` | `npm run start` |
| Angular | `templates/forge-starters/angular` | `npm run start` |

## Loading Flow

1. Dashboard creates a playground with a `template` enum value.
2. `/api/template/[id]` resolves that enum through `lib/template.ts`.
3. The API scans the matching starter directory into the JSON tree used by the file explorer.
4. The WebContainer preview transforms that tree into a mountable filesystem and starts the project with `npm run start`.

Saved playgrounds bypass the starter scan and load the persisted `TemplateFile` content instead.
