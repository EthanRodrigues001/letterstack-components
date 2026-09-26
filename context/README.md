# Context pack

Written for: another engineer, or another coding agent, picking this repo up cold.

This folder is checked in so anyone (or anyone's Claude) can read it and understand the
repo without re-deriving it from the source. Read the files in order; each is standalone.

| File | What it covers |
| --- | --- |
| [01-project.md](01-project.md) | What this repo is, the stack, the commands, current status |
| [02-architecture.md](02-architecture.md) | Every file that matters and what it does |
| [03-page-conventions.md](03-page-conventions.md) | How `content/docs` maps to routes and the sidebar |
| [04-markdown-features.md](04-markdown-features.md) | Which MDX features are enabled and the syntax for each |
| [05-decisions-and-gotchas.md](05-decisions-and-gotchas.md) | Decisions, and the traps that cost real time |
| [chat-log.md](chat-log.md) | Chronological log of the session that built this |

## The 60-second version

A **Fumadocs** documentation site for a fictional React component library called
**LetterStack**. All content is mock — invented props, invented version history — built to
exercise the Fumadocs feature set end to end, not to document a real package.

- Next.js 16 (Turbopack) + React 19 + Tailwind 4
- Fumadocs 16, **Glass** layout, `@fumadocs/base-ui` under the `fumadocs-ui` alias
- Content in `content/docs`, two version roots (`v2`, `v1`) behind a sidebar dropdown
- `npm run dev` then open <http://localhost:3000/docs> (redirects to `/docs/v2`)

## If you change content

Run `npm run check:icons` before committing. It fails on an icon name Lucide does not
export and on any page missing an icon — both of which show up as a ragged sidebar rather
than as an error. `next build` will not catch either.
