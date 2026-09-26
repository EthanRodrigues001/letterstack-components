# Page conventions

Reference: [fumadocs.dev/docs/page-conventions](https://www.fumadocs.dev/docs/page-conventions).
Every convention below is actually in use somewhere in `content/docs`.

## Slugs come from the file path

| File | Slugs | URL |
| --- | --- | --- |
| `v2/index.mdx` | `['v2']` | `/docs/v2` |
| `v2/installation.mdx` | `['v2', 'installation']` | `/docs/v2/installation` |
| `v2/components/button.mdx` | `['v2', 'components', 'button']` | `/docs/v2/components/button` |
| `v2/(internal)/roadmap.mdx` | `['v2', 'roadmap']` | `/docs/v2/roadmap` |
| `v2/components/overview.mdx` | `['v2','components','overview']` | `/docs/v2/components/overview` |

An `index` file takes the slug of its folder, which is why `v2/guides/index.mdx` answers at
`/docs/v2/guides`. The top level of `content/docs` holds only root folders and has no
`index.mdx`, so `/docs` is redirected to `/docs/v2` in `next.config.mjs`.

## Folder groups

A folder wrapped in parentheses organises source files without appearing in the URL.

```txt
content/docs/v2/(internal)/roadmap.mdx   →   /docs/v2/roadmap
```

Used here for [Roadmap](/docs/v2/roadmap), which belongs beside the other v2 pages in the
route tree but is easier to find in its own folder on disk.

## Root folders

A folder whose `meta.json` sets `root` becomes a navigation root. While you are inside it,
only its contents appear in the sidebar, and the Glass layout renders the set of roots as the
dropdown at the top of the sidebar. This site has two, which is the version switcher:

```json title="content/docs/v2/meta.json"
{
  "title": "v2.0",
  "description": "Latest release",
  "icon": "Layers",
  "root": true
}
```

```json title="content/docs/v1/meta.json"
{
  "title": "v1.4",
  "description": "Legacy, security fixes only",
  "icon": "Archive",
  "root": true
}
```

```json title="content/docs/meta.json"
{
  "pages": ["v2", "v1"]
}
```

The top level lists the roots in the order the dropdown shows them, and holds no `index.mdx`,
so `/docs` is redirected to `/docs/v2` in `next.config.mjs`.

### Why `root: true` and not `root: "version"`

Fumadocs also accepts a **string** root type, which marks roots as interchangeable. That is
the more semantically correct choice for versions, but the Glass layout will not render it:

```js
// node_modules/fumadocs-ui/dist/layouts/glass/layout-tabs.js
const tabs = useTabsGroups(allTabs)
  .findLast((group) => typeof group.active?.root !== 'string')?.options ?? [];
if (tabs.length === 0) return;
```

A string root type makes `typeof group.active.root === 'string'`, `findLast` returns
`undefined`, and the dropdown renders nothing at all. With `root: true` the dropdown appears,
and same-path projection still works because `collectTabs` calls
`PageTree.findProjection` regardless of root type - so `/docs/v2/components/button` still
maps to `/docs/v1/components/button` when you switch. See `05-decisions-and-gotchas.md`.

## Page frontmatter

```mdx title="content/docs/installation.mdx"
---
title: Installation
description: Add LetterStack to a new or existing project.
icon: Download
---
```

```
title: {
      type: 'string',
      description: 'Sidebar label and page heading.',
      required: true,
    },
    description: {
      type: 'string',
      description: 'Shown under the title and used for the meta description.',
    },
    icon: {
      type: 'string',
      description: 'Resolved to a JSX element by the icon handler in lib/source.ts.',
    },
    full: {
      type: 'boolean',
      description: 'Render the page at full width, without the table of contents column.',
      default: 'false',
    },
```

## meta.json fields

```
title: {
      type: 'string',
      description: 'Display name for the folder.',
    },
    icon: {
      type: 'string',
      description: 'Icon name, resolved the same way as a page icon.',
    },
    pages: {
      type: 'string[]',
      description: 'Order and inclusion. When present, only what it lists appears.',
    },
    pagesIndex: {
      type: 'string',
      description: 'Which item the folder itself links to. Defaults to the index file.',
      default: "'index'",
    },
    defaultOpen: {
      type: 'boolean',
      description: 'Expand the folder on first render.',
      default: 'false',
    },
    collapsible: {
      type: 'boolean',
      description: 'Allow the reader to collapse the folder at all.',
      default: 'true',
    },
    root: {
      type: 'boolean | string',
      description:
        'Make this folder a navigation root. A string makes it an interchangeable root of that type.',
      default: 'false',
    },
    description: {
      type: 'string',
      description: 'Used when the folder is surfaced as a tab.',
    },
```

### pagesIndex in practice

`content/docs/v2/components/meta.json` points the folder at `overview` rather than an `index`
file, so the sidebar entry reads **Components** and lands on
[Overview](/docs/v2/components/overview).

```json title="content/docs/v2/components/meta.json"
{
  "title": "Components",
  "icon": "Boxes",
  "defaultOpen": true,
  "pagesIndex": "overview"
}
```

`pagesIndex` also accepts a link, which makes the folder jump off-site:

```json
{ "pagesIndex": "[Releases](https://github.com/letterstack/letterstack/releases)" }
```

### collapsible in practice

`content/docs/v2/guides/meta.json` sets `"collapsible": false`, so
[Guides](/docs/v2/guides) stays open in the sidebar.

## The pages array

Every operator, with where this repo uses it.

| Syntax | Meaning | Used in |
| --- | --- | --- |
| `page` | Include this page or folder, in this position | everywhere |
| `./nested/page` | Path reference | — |
| `---Label---` | Section separator | root `meta.json` |
| `---[Icon]Label---` | Separator with an icon | not used — see the note below |
| `[Text](/url)` | Internal link | — |
| `[Icon][Text](url)` | Link with an icon | — |
| `external:[Text](url)` | Force an external link | — |
| `...` | Everything not listed, alphabetical | `v2/meta.json` |
| `z...a` | Everything not listed, reverse alphabetical | `v2/components/meta.json` |
| `...folder` | Inline a folder's contents instead of nesting them | — |
| `!item` | Remove an item from `...` or `z...a` | `v2/components/meta.json` |
| `files` glob | Keep a file out of the collection entirely | `lib/source.ts` |

### The v2 root's meta.json

```json title="content/docs/v2/meta.json"
{
  "title": "v2.0",
  "description": "Latest release",
  "icon": "Layers",
  "root": "version",
  "pages": [
    "---Introduction---",
    "index",
    "installation",
    "quick-start",
    "theming",
    "(internal)/roadmap",
    "---Library---",
    "components",
    "guides",
    "---Resources---",
    "changelog",
    "..."
  ]
}
```

Reading that in order:
### A separator opens each group
    `---Introduction---` renders a label, not a link. Separators carry no icon here on
    purpose — mixing icon and text-only rows in one list is what makes a sidebar look ragged.
### Five pages are named explicitly
    So their order is editorial rather than alphabetical.
### Roadmap is listed by its real path
    `(internal)/roadmap`, not `roadmap`. `pages` entries are file paths relative to the
    folder, and a folder group is part of the path even though it is not part of the URL.
### Two folders nest as groups
    `components` and `guides` keep their own `meta.json` settings.
### The rest sweeps up
    `...` catches anything added later, so a new page is never silently invisible.
### Excluding include sources

`content/docs/snippets/` holds fragments pulled in with `<include>`. Those are not pages, so
they are excluded from the collection itself rather than from the sidebar — otherwise they
would fail the `title` requirement in `pageSchema`, and get their own routes and search
entries.

```ts title="lib/source.ts"
const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    files: ['**/*.{md,mdx}', '!snippets/**'], // [!code highlight]
    schema: pageSchema,
  },
});
```

Use `!item` in `pages` when a page should stay reachable but stay out of the sidebar — as
[Toast (draft)](/docs/v2/components/draft-toast) does.

## Icons

Fumadocs ships no icon library. The names in `icon:` fields are resolved at load time by the
Lucide plugin in `lib/source.ts`:

```ts title="lib/source.ts"
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()], // [!code highlight]
});
```

Any [Lucide](https://lucide.dev/icons) name in PascalCase works — in page frontmatter, in
`meta.json`, and inside separators and links.

## Internationalisation

Not enabled on this site. Two file layouts are supported when it is:

```txt tab="Dot parser"
meta.json
meta.cn.json
get-started.mdx
get-started.cn.mdx
```

```txt tab="Directory parser"
en/meta.json
en/get-started.mdx
cn/meta.json
cn/get-started.mdx
```

```ts tab="Config"
import type { I18nConfig } from 'fumadocs-core/i18n';

export const i18n: I18nConfig = {
  defaultLanguage: 'en',
  languages: ['en', 'cn'],
  parser: 'dot',
};
```
