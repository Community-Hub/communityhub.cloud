# Community Hub TypeScript migration

The user approved an Astro + TypeScript rebuild alongside the existing site, with subagents. The baseline is the current `site_src6` source, including the September 30 homepage edits. Its rendered output is captured in `reference/`; the source backup lives in `../backups/typescript-migration-20260930/source`.

## Acceptance

- Preserve all 32 content routes and three legacy redirects, page copy, metadata, links, imagery, embeds and responsive presentation.
- Make the new build independent of Python and the previous source/output directories. Node, Astro and TypeScript own the new build.
- Use a shared Astro document layout, shared navigation/footer components, typed content models and TypeScript rendering helpers.
- Convert browser behavior to checked TypeScript without suppressing type checking. Preserve the section owner, gesture latch, nested scroll exceptions, reflow anchoring, keyboard behavior, reduced motion and iframe interaction controls.
- Preserve one visible content section per swipe and keep every section reachable at phone, laptop and desktop sizes.
- Compare generated content against the frozen baseline, run the existing behavioral regressions against the new output, and inspect responsive screenshots.
- Keep the current prototype intact. Missing external source materials are preserved accurately; migration does not invent them.

## Implementation

1. Root: scaffold Astro, typed site context and shared components, assets/styles, route generation, parity tests and integration.
2. Agent: port home, products and audience/case-study pages to typed renderers.
3. Agent: port resources and detailed product pages to typed renderers.
4. Agent: port browser interactions to TypeScript, preserving initialization order and DOM contracts.
5. Root with agents: typecheck/build, compare every route, run browser regressions and visual inspection, fix differences, document commands and remaining external limitations.

The page renderers return structured page definitions (metadata + section markup). Astro owns document rendering; shared helpers own common content patterns. No Python interpreter, subprocess bridge, legacy generated HTML loader, or untyped JavaScript bundle is used by the finished build.

## Shared renderer contract

Page modules export `register(H: SiteContext): void`, importing the type from `../lib/site`. The context includes the original shared data and helper names so page content can be migrated faithfully.

- `H.page(slug, title, description, body, options?)` returns a `PageDefinition`; options are `{ current?, jsonld?, full_title?, dark_hdr? }`.
- `H.write_page(slug, page)` registers that definition. It does not write files.
- Other helpers use positional parameters in the same order as the Python helpers. Replace keyword arguments with their positional equivalent.
- `H.crumbs(...parts)` takes `[href: string | null, label: string]` tuples.
- `H.e(value)` escapes HTML; all known content is migrated verbatim.
- `H.json.dumps(value)` is `JSON.stringify(value)` compatibility for structured data; prefer native `JSON.stringify` in new code.
- Data exports are `PRODUCTS`, `PBY`, `GROUP_ORDER`, `GROUP_COLOR`, `AUDIENCES`, `ABY`, `CASES`, `RESOURCES`, `TESTIMONIALS`, `CV_SLIDES`, `CV_COLOR`, `TIMELINE`, `FUNDERS`, `ORG_LD`.
- Root owns redirect routes; agents need not port the obsolete product scaffolding in `pages_stub.py`.

All changes stay inside `site_ts/` except the source backup.
