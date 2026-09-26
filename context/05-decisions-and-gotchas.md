# Decisions and gotchas

Each entry is a thing that was not obvious from the docs and cost real time. If you are
changing this repo, read the gotchas before the decisions.

---

## Gotchas

### 1. `Invalid value for prop className on <div>` — a bug in fumadocs-ui's *docs* layout

The console error pointed at `app/docs/layout.tsx`, which made it look like a config
problem. It is not. In `layouts/docs/slots/sidebar.js`:

```js
children: [collapsed && jsx("div", {
  className: "absolute inset-s-0 inset-y-0 w-4",
  ...rest                      // <- rest.className is a FUNCTION (Base UI render prop)
}), ...]
```

Base UI passes `className` as `string | ((state) => string)` through render props. The
spread lands after the string literal and overwrites it with a function, so React refuses
the attribute.

**Nothing in this repo can fix it.** The Glass layout has no such spread, so switching
layouts resolved it. If you ever switch back to `DocsLayout`, the warning returns.

### 2. `pagesIndex` is silently cancelled if you also list the page in `pages`

`fumadocs-core/dist/dynamic-*.js`:

```js
if (indexPath) {
  if (excludedPaths.has(indexPath)) delete node.index;   // <- listing it in `pages` deletes it
  else excludedPaths.add(indexPath);
}
```

Listing an item in `pages` adds its path to `excludedPaths`, which deletes `node.index`.
The folder then renders as a **toggle button** instead of a **link**, with no error.

So you get one of two behaviours, never both:

| Config | Folder header | Overview row |
| --- | --- | --- |
| `pagesIndex: "overview"`, `overview` **not** in `pages` | links to Overview | not shown |
| `overview` **in** `pages` | toggles only | shown as first child |

This repo currently uses the second: `overview` is listed, so it appears inside the
Components list.

### 3. The Glass root dropdown ignores string root types

`layouts/glass/layout-tabs.js`:

```js
const tabs = useTabsGroups(allTabs)
  .findLast((group) => typeof group.active?.root !== 'string')?.options ?? [];
if (tabs.length === 0) return;
```

`root: "version"` is the semantically correct way to mark interchangeable roots, but it
makes `typeof group.active.root === 'string'`, so `findLast` returns `undefined` and the
dropdown **renders nothing at all** — no error, no warning, just an absent control.

`root: true` renders, and same-path projection still works, because `collectTabs` calls
`PageTree.findProjection` regardless of root type. Hence `root: true` on `v2` and `v1`.

### 4. Folder-group paths must be written in full in `meta.json`

`pages` entries are **file paths relative to the folder**, not URL slugs. A folder group is
part of the path even though it is not part of the URL:

```jsonc
"pages": ["roadmap"]              // silently does nothing
"pages": ["(internal)/roadmap"]   // correct
```

The wrong form produces no error; the page just drops out of the sidebar into the fallback
tree.

### 5. Unknown icon names fail soft

`lucideIconsPlugin` logs `[lucide-icons-plugin] Unknown icon detected: X` and renders
nothing. The build still succeeds, and you get one sidebar row whose text starts 20px left
of its neighbours.

`History` and `Github` both look plausible and are both absent from lucide-react's `icons`
map. `npm run check:icons` exists because of this.

### 6. `tsconfig.tsbuildinfo` caches stale type errors

`incremental: true` meant `tsc --noEmit` kept reporting an error from a file that had
already been fixed, with the *old* source in the message. `rm tsconfig.tsbuildinfo` cleared
it. Worth remembering before chasing a type error that makes no sense.

### 7. `npm run lint` is broken

`typescript-eslint` does not support TypeScript 7.0, which `package.json` pins. Pre-existing.
See `01-project.md`.

---

## Decisions

### Glass layout

Chosen by the repo owner. Side effects worth knowing: search moves to the header, page
components come from `layouts/glass/page`, and `glass.css` must be imported.

### Two version roots instead of one tree

`v2` (current, 18 pages) and `v1` (legacy, 6 pages) are both root folders, which is what
produces the version dropdown at the top of the sidebar. `v1` deliberately documents a
component (`Newsletter`) that `v2` removed, and styles against class names where `v2` uses
data attributes, so the migration guide has something real to point at.

### Snippets excluded from the collection, not the sidebar

`content/docs/snippets/` is `<include>` fragments. Excluding them via `files` in
`lib/source.ts` keeps them out of routes and search entirely. Excluding them with `!name` in
`meta.json` would only hide them from the sidebar, and they would still fail `pageSchema`.

### Icons on every page, none on separators

A list where some rows have an icon and some do not reads as ragged, because the text stops
sharing an x-position. Every page declares an icon; separators declare none. Enforced by
`npm run check:icons`.

### Separators kept minimal

An earlier version had separators inside the Components folder (`Primitives`, `Composite`)
and a `Library` separator above it. Both were removed: the nested separators added a `mt-4`
inside an already-indented list, and `Library` sat directly above a folder that already acts
as its own heading, stacking two margins. Folders are the grouping; separators are only for
runs of loose pages.

### `context/` is checked in

So that a person or an agent picking the repo up cold does not have to re-derive any of the
above from `node_modules`.
