# Spencer & Williams

A multi-vertical demo platform built with **Next.js 16** and **Algolia**. Each vertical is a self-contained App Router experience with its own configuration, theme, navigation, and hit templates — all driven from a single `VerticalConfig` object.

## Verticals

The canonical list of verticals lives in [src/verticals/index.ts](src/verticals/index.ts) — adding an entry there makes it appear on the landing page and in the switcher automatically. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#3-vertical-architecture) for the full per-vertical index and route breakdown, and [adding a new vertical](docs/ARCHITECTURE.md#15-adding-a-new-vertical).

## Prerequisites

- **Node.js 24** (pinned in [.nvmrc](.nvmrc))
- **npm** (bundled with Node)

If you use [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm use
```

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000> for the landing page; click any vertical card to enter its experience.

## Repo map at a glance

```
src/app/            Next.js App Router (one folder per vertical + landing)
src/components/     Shared UI (providers, search, filters, hit, recommend, map, …)
src/features/       Self-contained feature modules (aiAssistant)
src/hooks/          Cross-vertical React hooks
src/lib/            cn, animations, composition helpers, routes, vertical icons
src/providers/      Root QueryProvider (TanStack Query)
src/stores/         Jotai atoms (activeConfig, searchClient, cart, demoOptions, …)
src/types/          Shared types: VerticalConfig + generic HitTemplate
src/utilities/      Hit-value mappers, image URL builder, filter/facet helpers
src/verticals/      Single source of truth: registered vertical configs
__tests__/          Vitest tests (mirrors src/ and app/)
docs/               Architecture documentation (ARCHITECTURE.md)
```

## Tech stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS v4 · Algolia (`algoliasearch` lite + `react-instantsearch` + `react-instantsearch-nextjs`, Composition API, Agent Studio) · Jotai · TanStack Query · Mapbox GL · Motion · Vitest + Testing Library.

## Environment

Algolia credentials are baked into each vertical's `config.ts` (demo search-only keys). Runtime variables live in `.env.local` — copy [`.env.example`](.env.example) to `.env.local` and fill in real values:

```bash
# Mapbox token used by the travel map and store locators.
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here

# Supabase project hosting the `extract-grocery-list` Edge Function (grocery
# "Import from photo"). Without these, that feature is disabled; the OpenAI key stays server-side in the function.
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Filter Suggestions is hidden across all verticals by default.
# Set to `true` to bring back the widget and its demo-options toggle.
NEXT_PUBLIC_SHOW_FILTER_SUGGESTIONS=false
```

The maps degrade gracefully without their token; everything else runs as-is. All variables are `NEXT_PUBLIC_*`, so they're inlined at build time — restart or rebuild after changing them.

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — full project rundown: vertical architecture, provider stack, Algolia wiring, demo features (composition, personalization, recommendations, geo/maps), AI assistant, theming, state, hooks catalogue, tooling, CI, and a recipe for adding a new vertical.

## Contributing

`npm install` installs Husky hooks via `prepare`:

- **pre-commit** runs [lint-staged](https://github.com/lint-staged/lint-staged) (Prettier + ESLint on staged files).
- **pre-push** runs the full Vitest suite.

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs format + lint, typecheck, and tests with coverage. Production builds run on PRs to `main` and Dependabot PRs to `develop`.
