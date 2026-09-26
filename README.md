# letterstack-components

A [Fumadocs](https://fumadocs.dev) documentation site for **LetterStack**, a fictional React
component library for newsletters and editorial layouts.

All content is mock — invented props, invented version history. The repo exists to exercise
the Fumadocs feature set end to end against content that looks like real documentation.

## Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000/docs> — it redirects to `/docs/v2`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run types:check` | `next typegen && tsc --noEmit` |
| `npm run check:icons` | Validate every icon name used in `content/docs` |
| `npm run lint` | Currently broken — see `context/01-project.md` |

Run `npm run check:icons` after editing content. An icon name Lucide does not export fails
soft: the build succeeds and you get one ragged sidebar row.

## Layout

- Next.js 16 (Turbopack) + React 19 + Tailwind 4
- Fumadocs 16 with the **Glass** layout (`@fumadocs/base-ui` aliased to `fumadocs-ui`)
- Content in `content/docs`, two version roots (`v2`, `v1`) behind the sidebar dropdown

| Path | Purpose |
| --- | --- |
| `lib/source.ts` | Content collection, MDX plugin config, page-tree loader |
| `lib/layout.shared.tsx` | Nav title and GitHub link |
| `components/mdx.tsx` | MDX component registry |
| `app/docs/layout.tsx` | Glass layout and the root dropdown |
| `scripts/check-icons.mjs` | Icon name validation |
| `content/docs/snippets/` | `<include>` fragments, excluded from the collection |

## Context for new contributors

[`context/`](context/) is a checked-in pack written for someone — or some agent — picking
this repo up cold. Start at [`context/README.md`](context/README.md).

It covers the architecture, the page conventions as actually used here, the MDX features
that are enabled, and a list of gotchas that cost real time, including two upstream
fumadocs-ui behaviours that fail silently.
