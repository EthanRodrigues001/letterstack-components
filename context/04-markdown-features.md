# Markdown features

Reference: [fumadocs.dev/docs/markdown](https://www.fumadocs.dev/docs/markdown). The former `/docs/authoring/markdown` page was the live test for the plugin set configured in `lib/source.ts` and the component registry in
`components/mdx.tsx`.

## Frontmatter

```mdx
---
title: Markdown
description: Every Markdown and MDX feature enabled on this site.
icon: FileCode
---
```

`title` becomes the page heading, so the body should not repeat it as an `h1`.

## GitHub Flavored Markdown

**Bold**, _italic_, ~~strikethrough~~, `inline code`, and a bare URL that gets linked
automatically: https://fumadocs.dev.

- A list item
- Another one
  - Nested, one level down

1. Ordered
2. Still ordered

- [x] Task lists work
- [ ] This one is not done

> Blockquotes keep their own measure and rule.

| Left | Center | Right |
| :--- | :----: | ----: |
| a | b | c |
| longer cell | x | 42 |

Internal links are prefetched; external links get an icon. Compare
[Installation](/docs/v2/installation) with [Fumadocs](https://fumadocs.dev).

## Headings, anchors, and the table of contents

Heading ids are slugified from the text. Three tags change that:

```md
## Custom anchor [#my-own-id]

## Hidden from the table of contents [!toc]

## Only in the table of contents [toc]
```

### A heading with a custom id [#the-custom-one]

That heading is linkable as `#the-custom-one` rather than `#a-heading-with-a-custom-id`.

### This heading is hidden from the TOC [!toc]

It renders in the page but the sidebar list skips it — handy for a heading that only exists
to break up a long section.

## Callouts

All five types, from `fumadocs-ui/mdx`:

> No type given, so this is `info`.

> **Info**
> Context the reader can take or leave.

> **Warning**
> Something that will bite later if ignored.

> **Error**
> Something that is already broken.

> **Success**
> Confirmation that a step worked.

> **Idea**
> An aside or a suggestion.

```mdx title="Syntax"
> **Warning**
> Something that will bite later if ignored.
```

## Code blocks

### Title

```js title="hello.js"
console.log('Hello World');
```

### Line numbers

```ts lineNumbers
const greeting = 'Hello World';
console.log(greeting);
```

Starting from a different line, for excerpts:

```js lineNumbers=42
function main() {
  console.log('this block starts at line 42');
  return 0;
}
```

### Shiki transformer notations

```tsx
const kept = 'normal line';
const highlighted = 'this line is highlighted'; // [!code highlight]
// [!code word:needle]
const withWord = 'find the needle in this line, and this needle too';
const removed = 'old value'; // [!code --]
const added = 'new value'; // [!code ++]
const focused = 'only this line is in focus'; // [!code focus]
```

```md title="Syntax"
// [!code highlight]      highlight this line
// [!code word:target]    highlight every occurrence of "target" below
// [!code --]             render as a removed diff line
// [!code ++]             render as an added diff line
// [!code focus]          dim everything except this line
```

### Inline code highlighting

Inline code can be highlighted too: `const total = items.length{:ts}` and
`--ls-measure: 66ch{:css}`. The trailing `{:lang}` is the trigger, enabled by
`inline: 'tailing-curly-colon'` in `lib/source.ts`.

### Code block tabs

Consecutive fences with a `tab` attribute group into one tabbed block:

```ts tab="TypeScript" title="subscribe.ts"
export async function subscribe(email: string): Promise<void> {
  await fetch('/api/subscribe', { method: 'POST', body: email });
}
```

```js tab="JavaScript" title="subscribe.js"
export async function subscribe(email) {
  await fetch('/api/subscribe', { method: 'POST', body: email });
}
```

````md title="Syntax"
```ts tab="TypeScript"
// ...
```

```js tab="JavaScript"
// ...
```
````

Add `tab-group="name"` to keep several tabbed blocks on the page in sync:

````md
```ts tab="Next.js" tab-group="framework"
```
````

### Package install blocks

An `npm` fence expands into one tab per package manager. The choice persists across the whole
site, because `lib/source.ts` passes `persist: { id: 'package-manager' }`.

```npm
npm install @letterstack/react -D
```

````md title="Syntax"
```npm
npm install @letterstack/react -D
```
````

## Includes

`<include>` inlines another file from the collection, resolved relative to the current
document. This site keeps reusable fragments in `content/docs/snippets/`, which is excluded
from the collection in `lib/source.ts` so the fragments never become pages of their own.

<!-- include: ../snippets/mock-banner.mdx -->

```mdx title="Syntax"
<!-- include: ../snippets/mock-banner.mdx -->
```

## Steps

Two ways to get the same stepped layout. Tag sibling headings with `[step]`:

```md
### Install the package [step]

### Wire up the provider [step]
```

Or number them, which reads better in the raw file:

```md
### 1. Install the package

### 2. Wire up the provider
```

[Installation](/docs/v2/installation) uses the tagged form. The `` and `
`
components are also available directly when you want a step that is not a heading:
### Write the page
    Put it in `content/docs`, with frontmatter.
### Place it in the sidebar
    Add it to the nearest `meta.json`, or let `...` pick it up.
### Check it renders
    `npm run dev`, then open the route.
## Tabs

The component form, for prose rather than code:

<Tabs items={['Server Component', 'Client Component']} groupId="component-kind" persist>
  <Tab value="Server Component">
    Renders on the server, ships no JavaScript, cannot hold state. This is the default for
    everything in LetterStack.
  </Tab>
  <Tab value="Client Component">
    Needs `'use client'`. Required for event handlers, effects, and anything reading the
    viewport.
  </Tab>
</Tabs>

```mdx title="Syntax"
<Tabs items={['Server Component', 'Client Component']} groupId="component-kind" persist>
  <Tab value="Server Component">Renders on the server.</Tab>
  <Tab value="Client Component">Needs 'use client'.</Tab>
</Tabs>
```

`groupId` plus `persist` keeps the selection when the reader moves between pages.

## Accordions

<Accordions type="single">
  <Accordion title="When should I use an accordion?">
    For answers most readers will skip. Anything on the main path should stay visible —
    collapsed content is not found by eye, and in some browsers not by find-in-page either.
  </Accordion>
  <Accordion title="Can several be open at once?">
    Yes — pass `type="multiple"` to `Accordions`.
  </Accordion>
</Accordions>

```mdx title="Syntax"
<Accordions type="single">
  <Accordion title="A question">The answer.</Accordion>
</Accordions>
```

## File trees

- content
  - docs
    - meta.json
    - meta.json
    - snippets
      - mock-banner.mdx

```mdx title="Syntax"
- content
  - index.mdx
```

## Type tables

Used on every component page for props, and on [Theming](/docs/v2/theming) for CSS custom
properties.

```
variant: {
      type: "'solid' | 'outline' | 'ghost'",
      description: 'Visual style.',
      default: "'solid'",
    },
    pending: {
      type: 'boolean',
      description: 'Disable interaction and set aria-busy.',
      default: 'false',
    },
    onSelect: {
      type: '(value: string) => void',
      description: 'Called when the selection changes.',
      parameters: [{ name: 'value', description: 'The newly selected value.' }],
      returns: 'void',
    },
    legacyProp: {
      type: 'string',
      description: 'Kept for one more minor release.',
      deprecated: true,
    },
```

```mdx title="Syntax"
```
variant: {
      type: "'solid' | 'outline'",
      description: 'Visual style.',
      default: "'solid'",
    },
```
```

## Cards

- No href — just a panel
  - [With a link](/docs/v2/installation) - Internal links are prefetched.
  - [External](https://fumadocs.dev/docs/markdown) - Gets the external link treatment.
```mdx title="Syntax"
- [With a link](/docs/v2) - A description.
```

To list a folder's siblings without hand-writing them, use `getPageTreePeers` in a page
component:

```tsx
import { getPageTreePeers } from 'fumadocs-core/page-tree';
import { source } from '@/lib/source';

{getPageTreePeers(source.getPageTree(), '/docs/v2/components').map((peer) => (
    <Card key={peer.url} title={peer.name} href={peer.url}>
      {peer.description}
    </Card>
  ))}
;
```

## Images

`img` is mapped to `ImageZoom` in `components/mdx.tsx`, so any image in prose is clickable to
enlarge. Markdown image syntax is enough:

```md
![A rendered issue page](/screenshots/issue.webp)
```

Images referenced by a relative path are imported at build time, which lets `next/image` size
and optimise them.

## Banners and inline tables of contents

Two more registered components, for when a page needs them:

```mdx
<Banner id="v2-out" variant="rainbow">
  LetterStack v2 is out.
</Banner>

<InlineTOC items={toc} />
```

## What is configured where

| Feature | Source |
| --- | --- |
| GFM, headings, images, structure | `mdxPreset` defaults |
| `<include>` | always on, from `fumadocs-mdx` |
| Code block tabs, `tab="..."` | `remarkCodeTabOptions` |
| `npm` fences | `remarkNpmOptions` |
| `[step]` headings | `remarkSteps` |
| Themes, inline highlighting | `rehypeCodeOptions` |
| Callout, Card, Tabs, Steps, Files, TypeTable | `components/mdx.tsx` |

```ts title="lib/source.ts"
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

> **Collection MDX options replace the defaults**
> Passing `mdxOptions` to a collection drops the built-in plugins, which is why this config calls `mdxPreset` and layers on top of it rather than returning a bare object.
