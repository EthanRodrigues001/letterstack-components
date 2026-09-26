# The email editor

The reason this repo exists. Everything in `content/docs` is still mock content for a
fictional library; **this** is the real thing.

## What it is

A block-based email editor, ported from the LetterStack email SaaS and opened up as a
shadcn registry. The comparison point is [react.email/editor](https://react.email/editor) —
Resend's Tiptap-based editor. The intent here is to ship the same capability as parts you
can take separately, rather than one component you either adopt whole or not at all.

## Where it lives

| Route | What |
| --- | --- |
| `/editor` | The editor on its own |
| `/lab` | The same editor with the agentic assistant attached |
| `/api/agent/chat` | One model call per step, streamed back |

Both routes are in the `app/(editor)` group, which exists to put `.letterstack-ui` on a
wrapper — see the theming note below.

```
components/editor/
  editor-shell.tsx          the whole thing, 1.6k lines — layout, undo, autosave, views
  canvas-context.tsx        selection + insertion state shared by the canvas
  canvas-block.tsx          one block on the canvas: selection, drag handles, drop lines
  canvas-block-preview.tsx  how each block type renders in the canvas
  sortable-block-list.tsx   dnd-kit wiring for a list of blocks
  column-resizer.tsx        drag to change column widths
  block-palette.tsx         the blocks bar
  block-inspector.tsx       the properties panel, one editor per block type, 950 lines
  inspector-controls.tsx    the shared field controls
  rich-text-editor.tsx      Tiptap, restricted to marks that survive email clients
  slash-command-extension.ts
  block-bubble-menu.tsx     selection toolbar inside the canvas
  formatting-toolbar.tsx    the toolbar above the canvas
  styles-panel.tsx          document theme: colour, width, font, radius, spacing
  sections-panel.tsx        outline of the document
  optimize-panel.tsx        deliverability checks
  settings-sheet.tsx        subject, preheader, sender
  preview-dialog.tsx        desktop / mobile preview
  image-upload-input.tsx    URL field — see "No image upload"
  social-links-field.tsx
  html-code-field.tsx       CodeMirror, for the rawHtml block
  agent/                    the assistant (only mounted on /lab)

lib/email/
  document.ts               the data model — block types, helpers. No React, no DOM.
  compiler.ts               document -> table-based HTML with inlined styles
  social.ts                 the social icon set
  shadow.ts                 container shadow helper
  normalize-raw-html.ts     sanitiser for the rawHtml block
  unsubscribe.ts
  templates.ts              starter documents
  theme-presets.json

lib/agent/
  use-agent.ts              the agent loop — runs in the browser
  tools.ts                  what the model can do to a document
  context.ts                the system prompt + per-turn document summary
  commands.ts               slash commands that apply without a model call
  models.ts                 the model registry
  api-key.ts                bring-your-own-key storage
```

## How the agent works

The loop is in the browser, not on the server. Tools are declared to the AI SDK **without**
an `execute` function, so the SDK forwards every tool call to the client, where
`use-agent.ts` applies it to the document in React state and decides whether to continue.

```
send → server makes ONE model call → tool calls stream back
     → applied to the EmailDocument synchronously
     → continue, or stop
```

Two consequences worth knowing:

- Edits land instantly and the user watches the email change, because nothing round-trips.
- The server never sees the document, which is why `context.ts` rebuilds a summary each turn.

A whole turn reverts as one action rather than one undo step per tool call.

### Bring your own key

The hosted version kept the key server-side and metered it per account. There is no account
here and a shared key would mean paying for every visitor, so the visitor supplies their own
Google AI Studio key. It is kept in `localStorage`, sent to `/api/agent/chat` on each turn,
forwarded to Google, and never logged or stored server-side. `lib/agent/api-key.ts` says the
same thing to anyone reading the code, and the panel says it to anyone pasting a key.

The route still falls back to `GOOGLE_GENERATIVE_AI_API_KEY`, so a private deployment can
delete `api-key-field.tsx` and configure a key normally.

**Dropped in the port:** `lib/agent/budget.ts`, the database-backed usage ledger, along with
auth and the organization checks. They needed a database and an account.

## Theming — three separate systems, deliberately

This is the part most likely to be broken by a well-meaning change.

1. **Fumadocs** owns the documentation chrome. Tokens are `--color-fd-*`. It defines the
   `dark` variant itself, in its own `base.css`. Untouched.

2. **The editor's shadcn palette** is scoped to `.letterstack-ui`, never `:root`. A
   component library has no business repainting the page it is dropped into — take the
   editor into another app and it inherits that app's shadcn theme. Only the `--color-*`
   *names* are registered globally, in `@theme inline`, because that is what generates
   `bg-background` and friends; they resolve to nothing outside the scope, so they add
   vocabulary without changing appearance. Font, shadow and spacing scales are left alone.

3. **The email theme** belongs to the document. The canvas applies it as inline styles on
   its wrapper, and the compiler writes it as inline styles into the exported HTML. It never
   touches a stylesheet, which is the only thing that works in email clients anyway.

`app/global.css` carries this as a comment at the top. Read it before editing that file.

## No image upload

`image-upload-input.tsx` is a URL field and nothing more. Uploading means picking a storage
provider, and a component library should not make that choice for the host app. A button
that produced a `data:` URL instead would be actively worse: it inlines megabytes of base64
into an email that most clients then refuse to render.

To add uploading, wrap the field — keep the URL input, add your own button, call `onChange`
with the URL your storage returns.

## The registry

`registry.json` is **generated**, not hand-written. `npm run registry:build` regenerates it
and then runs `shadcn build`, which writes the served files to `public/r/*.json` with each
file's contents inlined. Both steps have to run; publishing a stale `public/r` is the easy
mistake.

Only the item groups in `scripts/build-registry.mjs` are written by hand. Every
`dependencies` and `registryDependencies` entry is derived by reading the imports of the
files in that group, because a hand-maintained list drifts the moment someone adds an import
— and the failure is silent: the item installs and then fails to compile in the consumer's
app.

The script fails the build on three things:

1. A file listed in a group that does not exist.
2. An npm import that is not in `package.json` — it caught `@codemirror/view` and
   `@tiptap/core` being used directly while only present transitively.
3. **An `@/` import that no registry item ships.** This caught `components/app-dialogs.tsx`
   and `components/motion/range-slider.tsx`, both of which the editor imports and neither of
   which any item was shipping — `shadcn add email-editor` would have installed code that
   did not compile. They now ship as `editor-primitives`.

### The 13 items

| Item | Type | What |
| --- | --- | --- |
| `email-document` | lib | The data model. No React, no DOM. |
| `email-compiler` | lib | Document → email-safe HTML |
| `email-templates` | lib | Starter documents |
| `editor-primitives` | ui | The three components shadcn/ui does not ship |
| `email-canvas` | ui | The editable preview |
| `block-palette` | ui | The blocks bar |
| `block-inspector` | ui | The properties panel |
| `rich-text-editor` | ui | Tiptap, restricted for email |
| `formatting-toolbar` | ui | The toolbar above the canvas |
| `styles-panel` | ui | Document theme |
| `editor-panels` | ui | Outline, checks, settings, preview |
| `email-editor` | block | The whole editor |
| `email-editor-agent` | block | The assistant |

`editor-primitives` exists because `coss-dialog`, `app-dialogs` and `range-slider` are not
in shadcn/ui. The script keeps the canonical shadcn item list and treats anything under
`components/ui/` that is not on it as ours to ship.

## Still to do

- The docs under `content/docs` are still mock content for a fictional newsletter library.
  They should be replaced with real documentation for these components.
- No tests.
- The registry is generated and served but has never been installed into a clean app, so
  the dependency lists are derived-correct rather than proven-correct.
