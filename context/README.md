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
| [06-editor.md](06-editor.md) | **The email editor and the shadcn registry — the real product** |
| [chat-log.md](chat-log.md) | Chronological log of the session that built this |

## The 60-second version

Two things share this repo.

**The product**: a block-based email editor, ported from the LetterStack email SaaS and
published as a **shadcn registry** — 13 items, from the document model up to the whole
editor. The comparison point is Resend's react.email/editor; the intent here is to ship the
same capability as parts you can install separately. Read [06-editor.md](06-editor.md).

**The site around it**: a Fumadocs documentation site. Its content is still mock — invented
props for a fictional newsletter library — and is due to be replaced with real docs for the
editor.

- Next.js 16 (Turbopack) + React 19 + Tailwind 4
- Editor: Tiptap 3, dnd-kit, shadcn/ui, CodeMirror; AI SDK 7 + Gemini for the assistant
- Docs: Fumadocs 16, **Glass** layout, `@fumadocs/base-ui` under the `fumadocs-ui` alias

```bash
npm install && npm run dev
```

| Route | What |
| --- | --- |
| `/editor` | The editor |
| `/lab` | The editor plus the agentic assistant (bring a Google AI Studio key) |
| `/docs` | The documentation site (redirects to `/docs/v2`) |

## Before you commit

| If you changed | Run | Why |
| --- | --- | --- |
| Anything the registry ships | `npm run registry:build` | Regenerates `registry.json` and `public/r/*.json`. Fails on an import no item ships. |
| `content/docs` | `npm run check:icons` | An unknown icon name fails soft — the build succeeds and you get a ragged sidebar row. |
| Anything | `npm run types:check` | `npm run lint` is broken, see [01-project.md](01-project.md). |

Do not move the editor's shadcn palette onto `:root`. It is scoped to `.letterstack-ui` on
purpose — [06-editor.md](06-editor.md) explains what breaks.
