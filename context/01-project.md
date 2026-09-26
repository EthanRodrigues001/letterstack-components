# Project

## What this is

A documentation site built with [Fumadocs](https://fumadocs.dev) for **LetterStack**, a
fictional React component library for newsletters and editorial layouts.

**The library does not exist.** Every prop table, version number, changelog entry and
migration note is invented. The point of the repo is a working Fumadocs site with realistic
content shape — so the navigation, search, MDX pipeline and layout can be evaluated against
something that looks like real documentation instead of lorem ipsum.

If you are here to add real content, the mock pages are safe to delete; the wiring in
`lib/`, `app/` and `scripts/` is the part worth keeping.

## Stack

| Piece | Version | Note |
| --- | --- | --- |
| Next.js | 16.3.5 | App Router, Turbopack, `proxy.ts` middleware |
| React | 19.3 | Server Components by default |
| Fumadocs | 16.15.14 | `fumadocs-core` + `fumadocs-mdx` |
| Fumadocs UI | `npm:@fumadocs/base-ui@16.15.14` | aliased to `fumadocs-ui`, built on Base UI |
| Tailwind | 4.3 | via `@tailwindcss/postcss` |
| TypeScript | 7.0 | see the ESLint caveat below |
| Icons | `lucide-react` 1.47 | resolved by name at page-tree build time |

## Commands

```bash
npm run dev           # dev server on :3000
npm run build         # production build
npm run start         # serve the production build
npm run types:check   # next typegen && tsc --noEmit
npm run check:icons   # validate every icon name in content/docs
npm run lint          # BROKEN - see below
```

## Current status

Builds clean: 87 routes, 24 doc pages, no warnings.

- `/` — marketing-ish landing page
- `/docs` — 307 redirect to `/docs/v2`
- `/docs/v2/**` — the current version, 18 pages
- `/docs/v1/**` — a legacy version, 6 pages, reachable from the sidebar dropdown
- `/api/search` — Fumadocs search endpoint
- `/llms.txt`, `/llms-full.txt`, `/llms.mdx/docs/**` — LLM-readable exports
- `/og/docs/**/image.webp` — generated Open Graph images (Takumi)

## Known broken: `npm run lint`

`typescript-eslint` refuses to load against TypeScript 7.0, which `package.json` pins:

```
Error: typescript-eslint does not support TS 7.0.
```

This is a toolchain incompatibility that predates the current content work, and it is not
caused by anything in this repo's config. Two ways out, both a judgement call:

1. Pin `typescript` to `^6` until `typescript-eslint` ships TS 7 support
   ([tracking issue](https://github.com/typescript-eslint/typescript-eslint/issues/10940)).
2. Drop `eslint-config-next`'s type-aware rules and lint without the TS plugin.

`npm run types:check` works and does catch type errors, so the project is not unguarded.
