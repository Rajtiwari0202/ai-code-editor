# Contributing

Forge Editor should feel handcrafted and maintainable. Keep changes small, named clearly, and connected to user-facing behavior.

## Development Workflow

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Code Standards

- Prefer existing UI primitives from `components/ui`.
- Keep components focused and typed.
- Avoid adding dependencies unless they solve a real product problem.
- Keep AI and workspace operations behind explicit server or agent boundaries.
- Use small, reviewable diffs.

## UI Standards

- Design for an editor user, not a marketing page.
- Favor dense but readable layouts.
- Use icons for common tool actions.
- Keep cards for real grouped content, not as generic page decoration.
- Ensure text does not overlap or resize containers unexpectedly.

## Documentation Standards

Update docs when a change affects:

- architecture,
- setup,
- deployment,
- environment variables,
- user workflows,
- or security boundaries.

## Pull Request Checklist

- Describe the user-facing change.
- Note architectural impact, if any.
- Run lint and build.
- Include screenshots for visual changes.
- Document known risks or follow-up work.
