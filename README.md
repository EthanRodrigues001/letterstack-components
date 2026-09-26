# letterstack-components

A block-based **email editor**, published as a shadcn registry.

Resend built a Tiptap-based editor and shipped it as
[react.email/editor](https://react.email/editor). This is the editor from the LetterStack
email SaaS, opened up — same capability, but as parts you can install separately. Take the
whole editor, or just the canvas, the blocks bar, or the HTML compiler.

## Try it

```bash
npm install
npm run dev
```

| Route | What |
| --- | --- |
| [`/editor`](http://localhost:3000/editor) | The editor: canvas, blocks bar, inspector, styles, HTML and preview |
| [`/lab`](http://localhost:3000/lab) | The same editor with the agentic assistant attached |
| [`/docs`](http://localhost:3000/docs) | The documentation site |

No account, no database, no backend. Documents autosave to `localStorage`.

The assistant needs a Google AI Studio key, which you paste into the panel — it is kept in
your browser and forwarded to Google, never stored server-side. A
[free-tier key](https://aistudio.google.com/apikey) is enough. In your own deployment, set
`GOOGLE_GENERATIVE_AI_API_KEY` instead and delete the key field.

## Install a piece of it

```bash
npx shadcn@latest add email-editor
```

| Item | Type | What |
| --- | --- | --- |
| `email-document` | lib | The data model. No React, no DOM. |
| `email-compiler` | lib | Document → table-based HTML that survives Outlook and Gmail |
| `email-templates` | lib | Starter documents |
| `editor-primitives` | ui | The three components shadcn/ui does not ship |
| `email-canvas` | ui | The editable preview: selection, drag-and-drop, column resizing |
| `block-palette` | ui | The blocks bar |
| `block-inspector` | ui | The properties panel |
| `rich-text-editor` | ui | Tiptap, restricted to marks email clients support |
| `formatting-toolbar` | ui | The toolbar above the canvas |
| `styles-panel` | ui | Document theme |
| `editor-panels` | ui | Outline, deliverability checks, settings, preview |
| `email-editor` | block | The whole editor |
| `email-editor-agent` | block | The assistant |

`registry.json` and `public/r/*.json` are **generated** — run `npm run registry:build`, do
not hand-edit them. The generator derives every dependency by reading the real imports,
because a hand-maintained list drifts silently and the item then fails to compile in
someone else's app.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run registry:build` | Regenerate `registry.json` and `public/r/*.json` |
| `npm run types:check` | `next typegen && tsc --noEmit` |
| `npm run check:icons` | Validate every icon name used in `content/docs` |
| `npm run lint` | Currently broken — see `context/01-project.md` |

## Stack

Next.js 16 (Turbopack), React 19, Tailwind 4. Tiptap 3 and dnd-kit for the editor,
shadcn/ui on Base UI and Radix for its chrome, CodeMirror for the raw-HTML block, AI SDK 7
with Gemini for the assistant. Docs are Fumadocs 16 on the Glass layout.

### Theming

Three systems, kept apart on purpose:

- **Fumadocs** owns the docs chrome (`--color-fd-*`).
- **The editor's shadcn palette** is scoped to `.letterstack-ui`, never `:root` — so
  dropping the editor into your app picks up *your* theme.
- **The email theme** belongs to the document and only ever exists as inline styles, on the
  canvas and in the exported HTML. That is the only thing email clients honour anyway.

## Context for contributors

[`context/`](context/) is a checked-in pack written for someone — or some agent — picking
this repo up cold. Start at [`context/README.md`](context/README.md);
[`context/06-editor.md`](context/06-editor.md) covers the editor and the registry.

## Status

The editor is real. The documentation under `content/docs` is **not** — it is still mock
content for a fictional newsletter library, left over from scaffolding the docs site, and is
due to be replaced with real documentation for these components.
