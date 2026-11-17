<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project conventions

- Prefer simple, maintainable functions and composition. Do not introduce
  classes without a clear need.
- Use the established naming conventions: PascalCase component files and types,
  camelCase functions and values, kebab-case route segments, and
  UPPER_SNAKE_CASE module constants.
- Keep TypeScript contracts precise. Avoid `any`; validate external data at
  system boundaries.
- Follow the structure in `README.md` and `docs/ARCHITECTURE.md`: keep
  vertical-specific code under `src/app/<vertical>`, shared components in
  `src/components`, hooks in `src/hooks`, and shared atoms in `src/stores`.
- Keep local state in React, use existing Jotai stores only for shared reactive
  state, and use TanStack Query for server state where that pattern applies.
  Keep Algolia state within the existing InstantSearch providers and hooks.
- Preserve public component, hook, configuration, and hit-schema contracts.
  Prefer additive changes and update known callers, types, validation, and tests
  together when a contract changes.
- Reuse installed dependencies. Discuss and get approval before adding one.
- Add focused tests for changed behavior and important failure paths. Tests
  mirror the relevant `src` path under `__tests__`.
- For code changes, run formatting, `npm run lint`, `npm run typecheck`, and the
  relevant Vitest test. For the complete local suite, use `npm run test-all`.
- Do not log credentials, secrets, personal data, full prompts, or full records.
