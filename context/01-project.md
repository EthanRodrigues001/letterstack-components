# Project

## What this is

Two things, in one repo.

**1. The email editor — the real product.** A block-based email editor ported out of the
LetterStack email SaaS and published as a shadcn registry, so it can be installed whole or
in parts. Lives in `components/editor`, `lib/email` and `lib/agent`; surfaced at `/editor`
and `/lab`. See [06-editor.md](06-editor.md).

**2. A Fumadocs documentation site**, which came first and currently documents a *fictional*
newsletter component library. Every prop table, version number and changelog entry under
`content/docs` is invented. It is scaffolding waiting to be replaced with real
documentation for the editor — safe to delete when that happens. The wiring in `lib/source.ts`,
`app/docs` and `scripts/check-icons.mjs` is the part worth keeping.

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
| Editor | Tiptap 3 | restricted to marks that survive email clients |
| Drag and drop | dnd-kit | canvas reordering and the blocks bar |
| Editor UI | shadcn/ui on Base UI + Radix | scoped to `.letterstack-ui` |
| Assistant | AI SDK 7 + `@ai-sdk/google` | tools run in the browser, not on the server |

## Commands

```bash
npm run dev           # dev server on :3000
npm run build         # production build
npm run start         # serve the production build
npm run types:check   # next typegen && tsc --noEmit
npm run check:icons   # validate every icon name in content/docs
npm run registry:build # regenerate registry.json and public/r/*.json
npm run lint          # BROKEN - see below
```

## Current status

Builds clean, no warnings.

- `/` — landing page
- `/editor` — the editor
- `/lab` — the editor plus the agentic assistant
- `/api/agent/chat` — one model call per agent step
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
