---
name: create-custom-vertical
description: Scaffold a new custom vertical by cloning an existing commerce or federated-content vertical and rewiring it to the user's own Algolia app, indices, agents, theme, and assets. Use when someone wants to spin up a new demo (e.g. a custom storefront or content site) based on an existing one — asks a structured intake first, then generates the route, config, theme, and registration.
---

# Create a custom vertical

This skill guides a user through creating a **new vertical** in Spencer & Williams by cloning an existing one (commerce or federated-content archetype) and swapping in their own Algolia credentials, index names, Agent Studio IDs, theme colors, and assets.

Read [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) §3 (Vertical architecture) and §15 (Adding a new vertical) once at the start — it is the authoritative reference for everything below. `src/verticals/index.ts` is the source of truth for the current roster.

Do **not** start scaffolding until the intake (Phase 1) is complete. Never invent Algolia app IDs, API keys, index names, or agent IDs — these must come from the user. If a value is unknown, leave a clearly-marked `TODO` and tell the user at the end.

---

## Phase 1 — Intake (ask before building)

**Guiding principle: minimize typing, maximize clicking.** The user should mostly click through `AskUserQuestion` options, not fill in a long form. Only **three** things genuinely require typed input — **App ID, search API key, primary index name** — because they're secret to the user's Algolia app and unlock introspection. Everything else is either a **click** (archetype, clone source, routes, features, theme feel, font) or something you **derive/propose** and let the user approve (slug, display name, description, attributes, facets, sort replicas, and — where the API permits — secondary index names). Never hand the user a big paste-everything checklist; ask for the 3 essentials, then a tiny follow-up only for values the API can't give you (e.g. a Composition ID, a brand accent hex).

Use `AskUserQuestion` for every discrete choice. Batch related clickable questions into a single call (up to 4 at once) so the user answers them in one screen. Reserve free-text for the 3 essentials plus any ID/secret introspection can't recover.

**Always offer a "None" / opt-out option on every multi-select or optional question** (routes, AI features, demo toggles, and any similar group). The user should be able to decline a whole group in one click rather than being forced to pick something or leave it blank. **Place "None" LAST in the options list — never first.** (Recommended options go first; an opt-out is never the recommendation.)

**Option-count limit and splitting.** `AskUserQuestion` allows at most **4 options per question** (a hard tool limit) — so with a trailing "None", only **3 real items** fit in one question. If a group has more than 3 real items (e.g. the data-source/AI features: Agent Studio, Composition, Recommend, Personalization), **split it into two questions** rather than dropping any option. Both halves can live in the **same `AskUserQuestion` call** (a call accepts up to 4 questions), so the user still answers on one screen, and each half gets its own trailing "None".

**Group questions by concern, and ask them in order.** Keep all Algolia data/feature questions together (clone source, routes, AI/data features, demo toggles, suggestion indices) and ask them before the theme/branding questions (feel, font, accent). Never mix an Algolia-index question (like query/AI suggestions) into the branding screen — it belongs with the feature questions.

**Everything here is optional, and follow-ups are conditional: only ask for an item's details if the user opted into it.** If a feature, route, or suggestion index is declined (or "None" is picked), do **not** then ask for its IDs, index name, personas, models, or any other sub-info — skip straight past it and omit its config block. Never ask a question whose answer you won't use.

**Ordering matters: the clone-source options depend on the archetype answer, so ask archetype FIRST in its own `AskUserQuestion` call, then ask the clone source in a SEPARATE follow-up call whose options are filtered to only that archetype's verticals.** Never present a single batched question set where the clone-source list mixes commerce and federated examples — a user who picked Commerce must never see `b2b-content`/`travel` as clone options, and vice versa.

### 1a. Archetype & source (AskUserQuestion — two sequential calls)

**Step 1 — Which archetype?** (ask alone, wait for the answer)
  - **Commerce** — storefront: PLP, PDP, collections, cart, order, store locator, affinities. (existing: ecommerce, fashion, electronics, furnishing, grocery, b2b-warehouse)
  - **Federated content** — search across multiple content-type indices, tabbed/federated results, detail pages per type. (existing: travel, b2b-content)

**Step 2 — Which existing vertical should we clone?** Only after the archetype is known. List **only the verticals of the chosen archetype** from `src/verticals/index.ts` and let them pick the closest match. Recommend `ecommerce` for commerce and `b2b-content` for federated content as the most feature-complete starting points. (Read the current roster from `src/verticals/index.ts` and each config's shape to classify archetype rather than hardcoding the list — it drifts as verticals are added.)

- **Slug, display name, description** — don't ask the user to author these cold. **Propose** them from the primary index name / the vertical's purpose (e.g. index `acme_parts` → slug `acme-parts`, name "Acme Parts"), then let the user approve or tweak. The slug must be `kebab-case`, unique (not already in `src/verticals/index.ts`), and filesystem/route-safe.
- **Which optional routes to keep** (commerce only, `AskUserQuestion` multi-select) — the clone brings the full commerce route tree, but not every demo needs all of it. Offer the options below plus an explicit **None** choice; whatever isn't kept gets deleted in Phase 3 (Scaffold). Core routes (`search`, `product`, `category`, `cart`, `order`) are always kept and are not offered as choices.
  - **Store locator** (`/stores`) — needs a `locations` secondary index and the `locator` config block; drop it if there's no store data.
  - **Affinities** (`/affinities/[token]`) — personalization affinity landing pages; only meaningful with personalization enabled.
  - **Collections** (`/collection/[slug]`) — curated collection pages driven by `config.collections`; drop it if there are no collections.
  - **None (core routes only)** — keep just the core commerce routes; drop stores, affinities, and collections. Always include this as a selectable option so the user isn't forced to pick a surface they don't want.

  **Federated-content clones — ask the index/content-type shape up front.** A federated experience is defined by its content types, so it always has a primary index plus one or more secondary indices — ask how many and what each is before building. **Enforce a minimum of 2 indices** for the federated archetype: if the user asks for a single index, don't proceed as federated — tell them a single-index experience is the commerce/single-index shape and steer them to the Commerce archetype instead. In this codebase, **each content type is more than a config entry**: it drags along a search sub-route (`search/<type>/`), a detail route (`<type>/[id]/`), its own template + facets in `config.ts`, extractor/tab wiring in `_utils/` (see `getIndexConfig.ts`, `tabUtils.ts`), and a branch in the vertical's AI result renderer (`src/features/aiAssistant/verticals/<slug>-vertical.tsx`). So changing the count vs. the clone source means **adding or removing whole route+extractor+card sets**, not just editing `indices`.
  For each content type collect: a key/slug (e.g. `articles`), the index name, template attributes, facets, and whether it needs a detail page. If the requested count differs from the clone source (b2b-content ships 4: documentation, articles, blogs, resources), plan in Phase 3 (Scaffold) to clone or delete the corresponding route sets to match.

### 1b. Algolia connection — the ONLY required typing

Ask for exactly these three (they're secret to the user's app and unlock everything else). This is the one place free-text is unavoidable:

- **App ID**
- **API key** — ideally one with the **`search` + `settings` + `listIndexes` ACLs**. This single key is both used for Phase 2 introspection **and** written into `config.ts` (it's committed to source in this repo). Ask the user to provide a key with those ACLs so introspection can read the full picture.
- **Primary index name**

Why the extra ACLs: with `settings` + `listIndexes`, Phase 2 can read the index **settings** and the **index list** directly — giving you sort **replicas**, the full `attributesForFaceting` config, `searchableAttributes`, and the app's **secondary indices** (query suggestions / locations) automatically, instead of guessing. Note for the user: both `settings` and `listIndexes` are **read-only** ACLs — writing index settings requires a separate `editSettings` ACL, which the skill does not request and should not be granted. So a key scoped to `search` + `settings` + `listIndexes` is read-only and safe to commit; don't use an admin key.

If the key is **search-only** (no `settings`/`listIndexes`), that's fine — introspection degrades gracefully: it still derives attributes and facetable attributes from the `facets:["*"]` query trick, and falls back to asking the user for replicas and secondary index names.

Do **not** ask the user to type attribute paths, `imageHrefPrefix`, facet lists, sort replicas, or (where avoidable) secondary index names. Those are recovered in Phase 2:

- **Attributes / facets / `imageHrefPrefix`** — derived from real records and confirmed.
- **Sort replicas** — read from index settings (needs `settings` ACL); propose them with auto-labels for the user to approve. Replicas only work if the replica has its own ranking configured in Algolia.
- **Secondary index names** — auto-discovered via `GET /1/indexes` (needs `listIndexes` ACL); propose the likely `querySuggestions` / `aiSuggestions` / `locations` matches by name pattern for the user to confirm. Without that ACL, ask the user to name the secondaries — and offer a "skip / none" path.

If the user can't provide any key, skip Phase 2 and fall back to a manual attribute mapping.

### 1c. Agents & Algolia features / demo options (AskUserQuestion, multi-select)

Ask about **every** feature and demo option — don't assume defaults. These `config.features.*` flags are also what surfaces the runtime **demo-options panel** ([src/components/options/DemoOptions.tsx](../../../src/components/options/DemoOptions.tsx), backed by [src/stores/demoOptions.ts](../../../src/stores/demoOptions.ts)): each toggle in that panel appears **only when its feature is enabled in config**, so whatever the user turns on here is exactly what they'll be able to toggle live in the demo.

**Every group below is multi-select with a trailing "None" (last option, never first).** If "None" is picked, enable nothing from that group. Remember the 4-option cap: a group with more than 3 real items must be **split into two questions** (both can share one `AskUserQuestion` call), each ending in its own "None". All of these are Algolia/feature concerns — ask them together, before the branding questions in 1d.

**Data-source / AI features** — 4 real items, so **split into two questions** (e.g. "AI / assistant" = Agent Studio + Composition; "Merchandising" = Recommend + Personalization), each with a trailing "None". Collect the required IDs **only for the ones chosen**:

- **Agent Studio (AI assistant)** → needs `filterSuggestionsAgentID`, `shoppingAssistantAgentID`, `questionSuggestionsAgentID`, and/or `summaryAgentID`. (`filterSuggestionsAgentID` also drives the "Filter Suggestions" demo-options toggle.)
- **Composition API** → needs `compositionId` and/or `multiFeedCompositionId`.
- **Recommend** → which surfaces (homepage/pdp/cart) and which models (`bought-together`, `related-products`, etc.).
- **Personalization / personas** → whether to enable and whether to author personas (see the source vertical's `personas.ts`).

**Autocomplete / suggestion indices** (2 real items + trailing "None" fits one question) — these are *separate generated Algolia indices*, so the user must already have them; auto-discover or ask for the index name **only if selected**. They go under `config.algolia.indices`:

- **Query Suggestions** (`querySuggestions`) → powers the query-suggestion source in autocomplete. Index name auto-discoverable via the `*_query_suggestions` pattern; confirm.
- **AI Suggestions** (`aiSuggestions`) → powers the AI-suggestion source. Index name auto-discoverable via `*ai_suggestions`; confirm.

**Search-behavior demo toggles** — 4 real items, so **split into two questions**, each with a trailing "None". Each enabled toggle both sets the flag and becomes a live demo-options toggle; confirm the Algolia-side setup exists (they silently do nothing otherwise):

- **Neural Search** (`neuralSearch.enabled`) — semantic vs keyword search.
- **Dynamic Re-Ranking** (`dynamicReRanking.enabled`).
- **Query Categorization** (`queryCategorization.enabled`).
- **Dynamic Facet Ordering** (`dynamicFacetOrdering.enabled`).

If a feature isn't wanted, omit its block from `features` entirely (don't set it to a disabled stub) — an omitted feature simply won't appear in the demo-options panel.

### 1d. Theme & branding (mostly clicks)

Make these `AskUserQuestion` clicks — batch them into one call:

- **Feel** — "rounded & friendly" vs "sharp & minimal" (drives the radius tokens in the `.theme-<slug>` block).
- **Font** — Satoshi (default) / Inter / a custom family already loaded in `globals.css`.

Only one branding value may need typing:

- **Accent color** — offer to **derive a palette** as the default (no typing), and let the user paste a brand hex/OKLCH only if they want an exact color. This sets `--accent` (and the `--theme-accent-<slug>` token).

Assets are not intake — just tell the user at wrap-up that logo/favicon/banner go in `public/images/<slug>/` and that placeholders render until they're added.

---

## Phase 2 — Introspect the live index(es) (derive real attributes)

The whole point of this phase: a custom index has its **own attribute names and shapes**, so the cloned template/types/facets from ecommerce or b2b-content will be wrong. Read the real index with the user's API key, then generate the template, `hitValues` types, `imageHrefPrefix`, and facets from actual data — and show the user for confirmation before building.

Run this for the **primary index and every secondary/content-type index** the user named in Phase 1b, using the single `API_KEY` from Phase 1b. Use `Bash` (curl). URL-encode index names with slashes/spaces. Steps 2–3 need the key to carry the `settings` / `listIndexes` ACLs; if it's search-only they 403 and you fall back gracefully.

**1. Pull sample records + discover facetable attributes** (works even with a search-only key — `facets:["*"]` returns exactly the attributes configured in `attributesForFaceting`):

```bash
curl -sS -X POST \
  "https://${APP_ID}-dsn.algolia.net/1/indexes/${INDEX}/query" \
  -H "X-Algolia-Application-Id: ${APP_ID}" \
  -H "X-Algolia-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"query":"","hitsPerPage":5,"facets":["*"],"maxValuesPerFacet":5}'
```

**2. Read index settings** (for replicas, `searchableAttributes`, `attributesForFaceting` with modifiers like `searchable(...)`/`hierarchical`). Needs the `settings` ACL — succeeds if the Phase 1b key carries it; a search-only key 403s, so skip and rely on step 1 + the user:

```bash
curl -sS "https://${APP_ID}-dsn.algolia.net/1/indexes/${INDEX}/settings" \
  -H "X-Algolia-Application-Id: ${APP_ID}" -H "X-Algolia-API-Key: ${API_KEY}"
```

**3. List all indices** (to auto-discover secondary indices and replicas so the user doesn't have to name them). Needs the `listIndexes` ACL — succeeds if the key carries it; skip on 403:

```bash
curl -sS "https://${APP_ID}-dsn.algolia.net/1/indexes" \
  -H "X-Algolia-Application-Id: ${APP_ID}" -H "X-Algolia-API-Key: ${API_KEY}"
```

If this returns the index list, propose likely secondaries by name pattern (e.g. `*_query_suggestions`, `*ai_suggestions`, `generic_locations`) and replica indices (`*_price_desc`, etc.) for the user to confirm — no typing needed. If blocked, fall back to asking only for the names you still need.

**Derive from the responses:**

- **Attribute paths** — flatten nested objects in the sample `hits` to dotted paths (e.g. `category.name`, `authors.name`). These become the `template.attributes` map.
- **Semantic mapping** — infer which attribute is `name`/`title`, `description`, `image`, `price`, `brand`, `url`, category/breadcrumb. Heuristics: image = value that looks like a URL or path, or a key containing `image`/`thumbnail`/`photo`; price = numeric key named `price`/`amount`; hierarchical = keys matching `*.lvl0..N` or `*.level0..N` or `hierarchicalCategories`. When ambiguous (e.g. two plausible image fields), make a best-effort pick and **flag it as uncertain in the confirmation summary** below — don't fire extra blocking questions; the user resolves it when confirming.
- **`imageHrefPrefix`** — if the image attribute holds a **full URL**, leave the prefix empty; if it holds a **relative path/filename**, set the prefix to the CDN base and confirm it with the user. Add the image host to `next.config.ts` `images.remotePatterns` if it's a new domain.
- **Facets** — one `FacetConfig` per attribute returned in the `facets` map. Type: `hierarchical` for `*.lvlN` families, `slider` for numeric ranges (e.g. `price`), `color`/`size` for those attributes, else `refinement`. Confirm the shortlist and labels with the user (not every facetable attribute needs to be a filter).
- **Replicas** — if settings returned a `replicas` array, propose them as sort options and ask the user for human labels.
- **Catalog-shaping fields (commerce)** — derive these from the sample records + facet values instead of asking the user to type them, then confirm:
  - **`navigation`** and **`carouselCategories`** — take the top-level values of the hierarchical category facet (or the top refinement values) as the header nav + homepage category grid. The clone's categories are wrong for a new catalog, so always regenerate these.
  - **`merchandising.categoryAttribute`** — the attribute used for category pages (e.g. `categoryPageId`); look for a matching key in the records. **`nestedSeparator`** — infer from how hierarchical values are joined (e.g. ` > `).
  - **`collections`** (only if the Collections route is kept) — propose collection values from the relevant facet; author `label`/`description` with the user or leave sensible defaults.

**Present a concise derived summary** (attribute map + chosen facets + imageHrefPrefix) and let the user correct it before writing any config. This derived mapping — not the clone's — is what Phase 4 writes into `config.ts`, `types.ts`, and `hitValues.types.ts`.

## Phase 3 — Scaffold (clone the source vertical)

Work relative to the repo root. `<src>` = chosen source vertical slug, `<slug>` = new vertical slug.

1. **Copy the route tree:**
   ```
   cp -r src/app/<src> src/app/<slug>
   ```
   This brings over `config.ts`, `types.ts`, `hitValues.types.ts`, `personas.ts`, `layout.tsx`, `template.tsx`, `page.tsx`, `_components/`, `_utils/`, and every feature route (`search/`, `product/`, `cart/`, `order/`, `category/`, `collection/`, `stores/`, `affinities/` for commerce; `article/`, `podcast/`, `search/*` for federated).

2. **Rename files and symbols** to the new vertical. **Casing matters — the slug is kebab-case, but identifiers are not.** Derive names from the slug like this (for a slug such as `b2b-content` → `b2bContent` / `B2BContent`):
   - **Variables/exports** use `camelCase(slug)`: `<camelSlug>Config`, `<camelSlug>Vertical` (e.g. `b2b-content` → `b2bContentConfig`, **not** `b2b-contentConfig`).
   - **Types** use `PascalCase(slug)`: `<PascalSlug>ConfigType`, `<PascalSlug>HitTemplate`, `<PascalSlug>ProductHitValues`.
   - **Files/folders and `theme`/`slug` string values** stay **kebab-case** (`src/app/<slug>/`, `<slug>-vertical.tsx`, `theme: '<slug>'`).
   - `get<PascalSlug>ProductHitValues` for the extractor (and file); for federated verticals, the content-type extractors too.
   - Vertical-prefixed components in `_components/` (e.g. `EcommerceHeader` → `<PascalSlug>Header`, `EcommerceFooter`) and their usages.
   - Match the clone's actual export names first (`grep "export const .*Config" src/app/<src>/config.ts`) rather than assuming, since older verticals may vary.

3. **Prune unselected routes** (from the Phase 1a "which routes to keep" answer). Delete each dropped route's folder and clean up its references so nothing dangles:
   - `/stores` → remove `src/app/<slug>/stores/`, the `locations` index from `config.ts`, the `locator` block, and any store-locator links in the header/footer/nav.
   - `/affinities/[token]` → remove `src/app/<slug>/affinities/`.
   - `/collection/[slug]` → remove `src/app/<slug>/collection/`, the `collections` array from `config.ts`, and any `CollectionBanners`/collection references in `page.tsx`.
   - After pruning, grep the new tree for imports of the deleted folders and remove them. Run `npm run typecheck` early to catch stragglers.

   **Federated clones — match the content-type set from Phase 1b.** For each content type the user wants that the clone source *doesn't* have, duplicate an existing content-type set — its `search/<type>/` sub-route, `<type>/[id]/` detail route, the `indices.<key>` entry in `config.ts` (with its `IndicesTemplates` generic in `types.ts`), the extractor/tab entry in `_utils/`, and a case in `src/features/aiAssistant/verticals/<slug>-vertical.tsx` — then rename and re-point it. For each content type the source has that the user *doesn't* want, delete that whole set. The tab list in `_utils/tabUtils.ts` / `getIndexConfig.ts` must end up listing exactly the kept content types.

4. **Fix imports.** All cross-folder imports use the `@/` alias — the `no-relative-import-paths` ESLint rule is configured with `allowSameFolder: false`, so even same-folder relative *imports* error. The one exception is barrel `index.ts` files, which re-export from the same folder with `export { X } from './X'`; keep that pattern if you copy a barrel. Update all `@/app/<src>/...` import paths to `@/app/<slug>/...` across the copied tree and wire `layout.tsx` to import `<camelSlug>Config as config`, its own header/footer, and `AIAssistantLayout` with `basePath = /${config.slug}`.

## Phase 4 — Rewire config

Edit `src/app/<slug>/config.ts` using the **Phase 2 derived mapping** (not the clone's attributes) plus the Phase 1 answers:

- `slug`, `name`, `description`, `theme` (set `theme: '<slug>'`).
- `assets`: `favicon`, `logo`, `banner` → `/images/<slug>/...`.
- `algolia`: `appId`, `apiKey`, `primaryIndex` (name, replicas, the derived template attributes, `imageHrefPrefix`, derived facets), and `indices` (secondary indices, each with its own derived template/facets).
- Update `types.ts` so `<PascalSlug>ConfigType`'s `IndicesTemplates` generic lists the exact secondary index keys used (see `src/app/b2b-content/types.ts` for a multi-index example).
- Update `hitValues.types.ts` to match the derived attributes, and the `_utils/` extractor's `imageFields`/`productUrl` to the real image attribute and detail-route shape.
- `features`: include only the enabled blocks with the user's real IDs (including `querySuggestions` / `aiSuggestions` index entries under `algolia.indices` if chosen). Omit unwanted features.
- Commerce extras — source each correctly rather than copying the clone's:
  - `navigation`, `carouselCategories`, `merchandising` — write the **Phase 2 derived** values (real categories/attribute), not the clone's.
  - `collections` — only if the Collections route was kept; use the derived collection values.
  - `locator` (`nounSingular`/`nounPlural`) — only if the Store locator route was kept; default to `store`/`stores` unless the user gives domain nouns (e.g. `warehouse`).
  - `homepageCarousels.ruleContexts` — these are Algolia query-rule context strings that can't be introspected. Leave a clearly-marked `TODO` (or drop the block) rather than silently keeping the clone's rule contexts, which won't match the new app; surface it at wrap-up.

## Phase 5 — Theme

In `src/app/globals.css`:

1. Add a `--theme-accent-<slug>: oklch(...)` token under the `:root` block (used by `DemoBar` and landing cards, outside theme scope).
2. Add a `.theme-<slug> { ... }` block (copy the source vertical's block as a base). Set `font-family`, the OKLCH color tokens (`--primary`, `--accent`, `--accent-foreground`, `--highlight`, `--muted`, `--border`, `--card`, etc.), and the semantic radius tokens (`--radius-card-base`, `--radius-button-base`, `--radius-image-base`, …) to match the chosen feel. Reuse tokens — do not hardcode colors in components.

## Phase 6 — Register

Append the new vertical to `src/verticals/index.ts`:

```ts
import { <camelSlug>Config } from '@/app/<slug>/config' // e.g. b2b-content → b2bContentConfig
// ...
export const verticals: Vertical[] = [
  // ...existing
  { config: <camelSlug>Config },
]
```

The landing grid (`src/app/page.tsx`) and `DemoBar` pick the vertical up from this array — but **`src/verticals/index.ts` is not the only place a vertical must be registered.** Several shared modules dispatch on `config.slug` via hardcoded maps. A missing entry fails one of two ways: the feature renders *nothing*, or it silently falls back to `ecommerce` and renders wrong data. Work through every row:

| Registry | Add | If missing |
|---|---|---|
| `src/components/autocomplete/hooks/useAutocompleteIndices.tsx` (`productExtractors`) | `'<slug>': get<PascalSlug>ProductHitValues` (map key is the kebab slug) | **Autocomplete renders nothing at all** — the extractor is `undefined`, so the products index is dropped and the panel has no sources. Not caught by `typecheck` (the map is cast to `Record<string, …>` and looked up via `slug in …` at runtime) — you only see it by opening the autocomplete. Commerce clones only. |
| `src/features/aiAssistant/verticals/registry.ts` (`verticalConfigBySlug`) | `'<slug>': <camelSlug>Vertical` — add `verticals/<slug>-vertical.tsx`, copying the clone source's | Falls back to `productVertical`, which hardcodes `ecommerceConfig`'s template and `slug="ecommerce"` → assistant trending items render **blank names** and link to `/ecommerce/product/…` |
| `src/features/aiAssistant/hooks/search/useSearch.ts` (`searchByVertical`) | a `<camelSlug>Search` from `useSingleIndexSearch({ extractor })` | Falls back to `ecommerceSearch`. Index and template come from the active config so it half-works, but the new vertical's `derive` callbacks never run |
| `src/lib/vertical-icons.ts` (`VERTICAL_ICONS`) | `<slug>: <LucideIcon>` | Cosmetic — falls back to `LayoutGrid` on the landing card and DemoBar |

Then grep the clone source's slug to catch per-vertical conditionals no table can enumerate: `grep -rn "<src>" src/ --exclude-dir=<src> | grep -v "^src/app/<src>"`. Anything shaped like `slug === '<src>' ? … : …` needs the new slug added alongside it (e.g. the editorial `font-secondary` product-name class in `useAutocompleteIndices.tsx`). `src/hooks/useMapboxMap.ts` is slug-keyed too but has a safe default — only touch it if the vertical needs its own map style.

## Phase 7 — Assets

- Remind the user to drop `logo`, `favicon`/monogram, and `banner` into `public/images/<slug>/` matching the paths in `config.assets`. Dynamic images fall back to `PlaceholderImage` via the shared `@/components/image/Image` wrapper until real ones exist.
- If Agent Studio is enabled, confirm `AIAssistantLayout` is mounted in `layout.tsx` (it is, if cloned from a vertical that had it). The per-vertical result-card renderer is registered in Phase 6 — commerce verticals can copy the clone source's `<src>-vertical.tsx` almost verbatim; a new federated content type needs its own renderer.

## Phase 8 — Verify

Run, in order, and fix anything that fails before handing off:

```
npm run typecheck
npm run lint
npm run dev    # then open http://localhost:3000/<slug>
```

Add tests for any new non-trivial logic (hit extractors, parsers, hooks) under `__tests__/app/<slug>/`, mirroring the source layout (Vitest + Testing Library). Skip tests for pure wrapper components and pages that only compose others.

---

## Guardrails

- **Config is the only source of truth** for index names, keys, agent IDs, and attribute paths — never hardcode them elsewhere.
- **No relative imports under `src/`** — always `@/...`.
- **Theme tokens over hardcoded values** — a token-based component adapts for free.
- **Never fabricate credentials or IDs.** Mark unknowns as `TODO` and surface them.
- Follow the repo's style rules in `.claude/CLAUDE.md` (functional patterns, naming, Prettier, `next/image` via the `Image` wrapper).

## Wrap-up

End with a summary: the slug/route, which vertical it was cloned from, what was wired vs. left as `TODO`, where the user must add assets, and any Algolia-side setup they still owe (replica ranking, agent/composition/personalization configuration in the dashboard).

Then close on a friendly note: the scaffold is done and `/${slug}` is live. From here the new vertical is just normal files in the repo — if they're ready to customize further (tweak the layout, add routes/facets, adjust the theme, wire more agents), they can simply ask right here and it'll get handled directly. No need to spell out anything about the skill itself — just invite them to keep going.
