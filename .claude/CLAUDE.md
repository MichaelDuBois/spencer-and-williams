# Spencer & Williams

> Deep reference: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) — full rundown of verticals, provider stack, Algolia wiring, demo features, AI assistant, theming, state, hooks, tooling/CI, and how to add a vertical. Read it on demand for detail beyond the rules below.

## Architecture: Multi-Vertical Demo Platform

The app serves multiple verticals, each under its own static route (`/<vertical>/*`) with a dedicated config and theme. Shared components adapt via theme tokens and variant maps; vertical-specific pages live under `src/app/<vertical>/`.

Each vertical has a `config.ts` that defines Algolia credentials, indices, replicas, facet configuration, template attribute mappings, image URL prefixes, navigation, and feature flags. This config is the source of truth for everything a vertical needs — never hardcode index names, API keys, or attribute paths outside of it.

## Theming System

Themes are applied via a `theme-[name]` CSS class on a wrapper element. Each theme sets CSS custom properties (OKLCH color space) in `globals.css` — colors (`--accent`, `--foreground`, `--background`, etc.), semantic border-radius tokens (`--radius-button`, `--radius-card`, `--radius-image`, etc.), and font family.

Always use theme tokens (`bg-accent`, `text-foreground`, `rounded-button`) instead of hardcoded values. A component that uses tokens adapts to every vertical for free.

## Component Styling: Variants Decision Tree

When theme tokens aren't enough (different typography, image treatment, spacing, interaction patterns), follow this decision tree:

1. **Same HTML structure, minor styling differences** — Use theme tokens alone. No variant map needed.

2. **Same HTML structure, significant styling differences** — Use a variant map (`VARIANT_CLASSES`). Keep it in the component file if it's small. If it grows large, extract it into a dedicated `*Variants.ts` file alongside the component. One or two targeted props (e.g., `showIcon`) are fine for isolated behavioral toggles without a full variant map.

3. **Different HTML structure or heavy conditional JSX** — Separate components. Place them in the vertical's `_components/` directory and prefix with the vertical name (e.g., `TravelHeroBanner.tsx`, `B2BContentHeader.tsx`).

4. **Business logic** — Never duplicate. Hooks, shared types, and utilities are always extracted and reused regardless of which approach the component uses.

Keep variant configs lean: prefer theme tokens over hardcoded values. If a variant config grows past ~15-20 fields, consider separate components.

## State Management

- **Jotai** (`src/stores/`) — global client state (active config, cart, filter panel, composition toggle). Use `atomWithStorage` for values that persist across sessions.
- **React Query** (`@tanstack/react-query`) — async/server data (recommendations, external fetches). 5min staleTime, 30min gcTime defaults.
- **Context providers** (`src/providers/`, `src/components/providers/`) — Algolia clients, theme, composition. These wrap per-vertical layouts.

Use Jotai for synchronous UI state, React Query for server/async data. Don't mix them for the same concern.

## Images

For dynamic or remote images (product/recipe/article images, anything from Algolia or a CDN, or any `src` that can be missing), use the shared `Image` wrapper (`Image` from `@/components/image/Image`). It wraps `next/image` and renders a `PlaceholderImage` when the `src` is null/undefined or fails to load, so you don't need manual `{src && <Image .../>}` guards. Use raw `next/image` (`Image` from `next/image`) only for guaranteed-present static assets (hero banners, logos, local `/images/*`). Never use raw `<img>` tags.

Use the `fill` prop with a `relative` parent container for responsive images, or provide explicit `width` and `height` props. Image URLs are built via `buildImageUrl()` using the `imageHrefPrefix` from the vertical config. Ensure remote image domains are configured in `next.config.ts`.

**`fill` always requires `sizes`.** Without it Next.js falls back to `100vw` and downloads a wildly oversized file (and warns in the console). `sizes` is the CSS layout width of the container, not a pixel-file width — the browser multiplies by device DPR itself, so a fixed `w-24` box is just `sizes="96px"`. Derive it from the container's Tailwind width at each breakpoint, largest first: a fixed box gets one value (`sizes="400px"`), a responsive box gets media queries (`w-24 sm:w-32` → `sizes="(min-width: 640px) 128px, 96px"`), and a grid/fluid box gets viewport units (`sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"`). This applies to raw `next/image` and to the shared `Image` wrapper, which forwards `sizes` through.

## Utilities and Conventions

- **`cn()`** (`src/lib/utils.ts`) — always use for combining Tailwind classes. It merges with `clsx` + `tailwind-merge` to avoid conflicts.
- **Animations** — use `motion/react` (Framer Motion v3) with shared presets from `src/lib/animations.ts` (`transitionFast`, `transitionSmooth`, `enterFadeIn`, `scrollFadeIn`, etc.). Don't define one-off durations or easings.
- **Icons** — `lucide-react` exclusively, imported individually for tree-shaking.

## TypeScript Types

Compose types additively. For any family of related types, define the smallest shared shape first and `extends` it as fields are needed — never define the widest type first and subtract from it with `Omit`/`Pick`. Each type should read as "the base, plus what this stage adds", so the type hierarchy follows the flow of the data and a reader sees fields being added rather than reverse-engineering what was taken away.

This applies wherever types relate: an entity gaining fields as it moves through the app, props shared between a wrapper and its children, config objects built on a common core. For example:

```ts
export interface CartProduct {
  objectID: string
  name: string
  price?: number
}

export interface CartItem extends CartProduct {
  quantity: number
  queryID?: string
}
```

Reuse the base type wherever the added fields don't apply, rather than declaring a near-duplicate shape beside it. Related types don't need to live in one file — keep each where it's used and extend across modules.

`Omit`/`Pick`/`Partial` are still the right tools for narrowing a type we don't own (a library type, an Algolia hit) or for a one-off local view. This rule is about the types we define ourselves.

## Testing

When working on a new branch, always identify what needs tests and include them. Tests live in `__tests__/` mirroring the source structure (e.g. `__tests__/app/grocery/` for `src/app/grocery/_utils/`). Use Vitest with `@testing-library/react` for component and hook tests, plain Vitest for pure functions. Test utilities/parsers/data transforms, hooks with non-trivial logic, and shared components with meaningful interaction or conditional rendering. Skip tests for simple wrapper components or pages that only compose other components.