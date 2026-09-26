# Architecture

## File map

```
app/
  layout.tsx                  root layout, RootProvider, metadataBase + title template
  global.css                  tailwind + fumadocs css, plus two sidebar fixes
  (home)/
    layout.tsx                HomeLayout
    page.tsx                  landing page
  (editor)/
    layout.tsx                puts `.letterstack-ui` on a wrapper + mounts <AppDialogs />
    editor/page.tsx           the editor
    lab/page.tsx              the editor + the agentic assistant
  api/agent/chat/route.ts     one model call per agent step, streamed back
  docs/
    layout.tsx                GlassLayout, receives the page tree
    [[...slug]]/page.tsx      the doc page shell (title, description, MDX body)
  api/search/route.ts         search index endpoint
  llms.txt/route.ts           short LLM index
  llms-full.txt/route.ts      full LLM export
  llms.mdx/docs/[[...slug]]/route.ts   per-page markdown source
  og/docs/[...slug]/route.tsx generated OG images (Takumi)

components/
  mdx.tsx                     the MDX component registry
  editor/                     the email editor — see 06-editor.md
  ui/                         shadcn primitives the editor needs
  app-dialogs.tsx             imperative alert/confirm/prompt
  motion/range-slider.tsx

lib/
  email/                      document model + HTML compiler — see 06-editor.md
  agent/                      the assistant's loop, tools and model registry
  utils.ts                    cn()
  source.ts                   the content collection + MDX plugin config + loader
  shared.ts                   app name, route constants, git config, baseUrl, url helpers
  layout.shared.tsx           nav title, header links, GitHub link
  cn.ts                       re-export of the `cn` package (currently unused)

scripts/
  check-icons.mjs             validates every icon name in content/docs
  build-registry.mjs          generates registry.json from real imports

content/docs/                 all documentation content (see 03-page-conventions.md)
context/                      this folder
registry.json                 generated — do not hand-edit
public/r/*.json               the served registry, written by `shadcn build`
components.json               shadcn config
next.config.mjs               MDX plugin, /docs redirect, Takumi external package
proxy.ts                      Next middleware
```

## How content becomes pages

```
content/docs/**/*.mdx
      │
      │  fumadocs-mdx bundler plugin (next.config.mjs -> createMDX())
      ▼
defineDocs() in lib/source.ts           <- macro, compiled at build time
      │  validates frontmatter against pageSchema
      │  runs the MDX pipeline (remark/rehype)
      ▼
docs.toFumadocsSource()
      │
      ▼
loader({ baseUrl: '/docs', plugins: [lucideIconsPlugin()] })
      │  builds the page tree from folder structure + meta.json
      │  resolves icon names into React elements
      ▼
source.getPageTree()  ->  app/docs/layout.tsx  ->  GlassLayout sidebar
source.getPage(slug)  ->  app/docs/[[...slug]]/page.tsx  ->  MDX body
```

There is **no `source.config.ts`**. This project uses the newer macro API, so the collection
and its MDX options live inline in `lib/source.ts`.

## lib/source.ts

Three things happen here.

**1. Snippets are excluded from the collection.**

```ts
files: ['**/*.{md,mdx}', '!snippets/**'],
```

`content/docs/snippets/` holds fragments pulled in with `<include>`. They have no
frontmatter, so leaving them in the collection fails `pageSchema`'s required `title`.
Excluding them here is different from excluding them from the *sidebar* with `!name` in
`meta.json` — these are not pages at all, so they get no route and no search entry.

**2. MDX options are rebuilt on top of the preset.**

Fumadocs' own type says it plainly:

> By defining a collection-level MDX options, **the default options & plugins will be removed**.

So the config calls `mdxPreset()` (which restores gfm, headings, images, code tabs, npm
blocks, structure, rehype-code and rehype-toc) and layers on top:

```ts
return mdxPreset({
  remarkPlugins: (plugins) => [remarkSteps, ...plugins],
  remarkNpmOptions: { persist: { id: 'package-manager' } },
  remarkCodeTabOptions: { parseMdx: true },
  rehypeCodeOptions: {
    themes: { light: 'github-light', dark: 'github-dark' },
    inline: 'tailing-curly-colon',
  },
});
```

`remarkSteps` goes **first**, before `remarkHeading`, so the `[step]` tag is stripped from
the heading text before the slug is generated. `<include>` is not in this list because
`fumadocs-mdx` always prepends `remarkInclude`, whatever the collection config says.

**3. The icon plugin.** `lucideIconsPlugin()` turns `icon:` strings into React elements.

## Layout

`app/docs/layout.tsx` uses the **Glass** layout:

```tsx
import { GlassLayout } from 'fumadocs-ui/layouts/glass';

<GlassLayout tree={source.getPageTree()} {...baseOptions()}>
```

Three things follow from that choice:

- Page components come from `fumadocs-ui/layouts/glass/page`, not `.../docs/page`.
- `global.css` must import `fumadocs-ui/css/generated/glass.css`.
- **Search lives in the header, not the sidebar.** The glass sidebar renders the nav title,
  icon links, the root dropdown and the page tree. It has no search trigger — that is in
  `layouts/glass/slots/header.js`. This differs from the default docs layout, and from
  fumadocs.dev's own site, where search sits above the sidebar.

## global.css

Three separate theming systems share that file and are deliberately kept apart — Fumadocs'
`--color-fd-*`, the editor's shadcn palette scoped to `.letterstack-ui`, and the email
theme which only ever exists as inline styles. [06-editor.md](06-editor.md) explains why,
and the file itself carries the same note at the top. **Do not promote the editor palette
to `:root`.**

Below that are two fixes for glass sidebar spacing. Each is commented in place.

1. **Nested folder rail.** Glass renders folder children with no indent, so a nested page
   sits flush with its folder. The rule adds a left margin, border and padding to the
   Collapsible panel. The selector distinguishes the panel from the Collapsible root by the
   root's `mt-4` class token — both carry `data-open`/`data-closed`.

2. **Double margin after a separator.** A separator (`mt-4`) immediately followed by a
   folder (also `mt-4`) stacked two margins, making one group heading sit twice as far from
   its neighbour as the next. The rule zeroes the folder's margin in that case.

## MDX component registry

`components/mdx.tsx` extends `defaultMdxComponents` with Tabs, Steps, Accordions, Files,
TypeTable, Banner, InlineTOC and ImageZoom, and maps `img` to `ImageZoom`.

`Tabs`/`Tab` are **not optional**: ```` ```npm ```` fences compile to `<Tabs>`, so leaving
them out breaks every install block on the site.
