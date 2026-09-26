/**
 * Generate registry.json from the real source files.
 *
 * The item groups below are the only thing written by hand. Every `dependencies`
 * and `registryDependencies` entry is derived by reading the imports of the
 * files in each group, because a hand-maintained dependency list drifts the
 * moment someone adds an import — and the failure is silent: the component
 * installs and then crashes in the consumer's app.
 *
 * Usage: npm run registry:build
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const HOMEPAGE = 'https://github.com/EthanRodrigues001/letterstack-components';

/**
 * type: shadcn's item kind.
 *   registry:lib   — framework-free logic
 *   registry:ui    — a part you compose with
 *   registry:block — a finished surface, several parts wired together
 */
const GROUPS = [
  {
    name: 'email-document',
    type: 'registry:lib',
    title: 'Email document model',
    description:
      'The data model every other piece reads and writes: block types, the document shape, and the pure helpers for adding, moving, duplicating and removing blocks. No React, no DOM.',
    files: ['lib/email/document.ts'],
  },
  {
    name: 'email-compiler',
    type: 'registry:lib',
    title: 'Email HTML compiler',
    description:
      'Turns an email document into table-based HTML with inlined styles that survives Outlook and Gmail. Includes the social icon set, container shadow helper and raw-HTML sanitiser.',
    files: [
      'lib/email/compiler.ts',
      'lib/email/shadow.ts',
      'lib/email/social.ts',
      'lib/email/normalize-raw-html.ts',
      'lib/email/unsubscribe.ts',
    ],
    registryDependencies: ['email-document'],
  },
  {
    name: 'email-templates',
    type: 'registry:lib',
    title: 'Starter templates',
    description: 'Ready-made email documents to open the editor with.',
    files: ['lib/email/templates.ts'],
    registryDependencies: ['email-document'],
  },
  {
    name: 'editor-primitives',
    type: 'registry:ui',
    title: 'Editor primitives',
    description:
      'The three components the editor needs that shadcn/ui does not ship: a stacking-aware dialog, the imperative alert/confirm/prompt helpers, and the drag-to-set range slider used throughout the inspector.',
    files: [
      'components/ui/coss-dialog.tsx',
      'components/app-dialogs.tsx',
      'components/motion/range-slider.tsx',
    ],
  },
  {
    name: 'email-canvas',
    type: 'registry:ui',
    title: 'Email canvas',
    description:
      'The editable preview. Renders the document, handles selection, drag-and-drop reordering, drop indicators and column resizing.',
    files: [
      'components/editor/canvas-context.tsx',
      'components/editor/canvas-block.tsx',
      'components/editor/canvas-block-preview.tsx',
      'components/editor/sortable-block-list.tsx',
      'components/editor/column-resizer.tsx',
      'components/editor/editor-types.ts',
    ],
    registryDependencies: ['email-document'],
  },
  {
    name: 'block-palette',
    type: 'registry:ui',
    title: 'Block palette',
    description:
      'The blocks bar: every insertable block as a draggable tile. Primitives are separated from composite starting layouts on purpose.',
    files: ['components/editor/block-palette.tsx', 'components/editor/editor-types.ts'],
    registryDependencies: ['email-document'],
  },
  {
    name: 'block-inspector',
    type: 'registry:ui',
    title: 'Block inspector',
    description:
      'The right-hand properties panel. One editor per block type, plus the shared field controls for spacing, colour, alignment, links and social rows.',
    files: [
      'components/editor/block-inspector.tsx',
      'components/editor/inspector-controls.tsx',
      'components/editor/image-upload-input.tsx',
      'components/editor/social-links-field.tsx',
      'components/editor/html-code-field.tsx',
    ],
    registryDependencies: ['email-document'],
  },
  {
    name: 'rich-text-editor',
    type: 'registry:ui',
    title: 'Rich text editor',
    description:
      'Tiptap editor tuned for email: only the marks that survive email clients, a slash command menu, and a selection bubble menu.',
    files: [
      'components/editor/rich-text-editor.tsx',
      'components/editor/slash-command-extension.ts',
      'components/editor/block-bubble-menu.tsx',
    ],
  },
  {
    name: 'formatting-toolbar',
    type: 'registry:ui',
    title: 'Formatting toolbar',
    description:
      'The contextual toolbar above the canvas — font, size, colour, alignment and link controls for the current selection.',
    files: [
      'components/editor/formatting-toolbar.tsx',
      'components/editor/formatting-options.ts',
      'components/editor/editor-toolbar-context.tsx',
    ],
  },
  {
    name: 'styles-panel',
    type: 'registry:ui',
    title: 'Styles panel',
    description:
      'Document-level theme: page and content colour, width, font, radius and spacing, with presets. Values live on the document and are written as inline styles at compile time, so nothing leaks into the host app.',
    files: ['components/editor/styles-panel.tsx', 'lib/email/theme-presets.json'],
    registryDependencies: ['email-document'],
  },
  {
    name: 'editor-panels',
    type: 'registry:ui',
    title: 'Editor side panels',
    description:
      'The remaining left-rail panels: section outline, deliverability checks, panel chrome, settings sheet and the preview dialog.',
    files: [
      'components/editor/side-panel.tsx',
      'components/editor/sections-panel.tsx',
      'components/editor/optimize-panel.tsx',
      'components/editor/settings-sheet.tsx',
      'components/editor/preview-dialog.tsx',
      'components/editor/preview-html.ts',
      'components/editor/nav-button.tsx',
    ],
    registryDependencies: ['email-document'],
  },
  {
    name: 'email-editor',
    type: 'registry:block',
    title: 'Email editor',
    description:
      'The whole editor: canvas, blocks bar, inspector, formatting toolbar, styles, undo/redo, autosave, HTML and preview views. Drop it in with an initial document and a save handler.',
    files: ['components/editor/editor-shell.tsx'],
    registryDependencies: [
      'email-document',
      'email-compiler',
      'email-canvas',
      'block-palette',
      'block-inspector',
      'rich-text-editor',
      'formatting-toolbar',
      'styles-panel',
      'editor-panels',
    ],
  },
  {
    name: 'email-editor-agent',
    type: 'registry:block',
    title: 'Email editor assistant',
    description:
      'The agentic panel. Tools run in the browser against the document so edits land instantly; the route makes one model call per step. Mounts through the editor’s renderAssistant slot. Ships a bring-your-own-key field — delete it and set GOOGLE_GENERATIVE_AI_API_KEY to use a server key.',
    files: [
      'components/editor/agent/agent-panel.tsx',
      'components/editor/agent/agent-composer.tsx',
      'components/editor/agent/mention-node.ts',
      'components/editor/agent/api-key-field.tsx',
      'lib/agent/use-agent.ts',
      'lib/agent/tools.ts',
      'lib/agent/context.ts',
      'lib/agent/commands.ts',
      'lib/agent/models.ts',
      'lib/agent/api-key.ts',
      'app/api/agent/chat/route.ts',
    ],
    registryDependencies: ['email-document', 'email-editor'],
  },
];

/** Bare module specifier -> the npm package it comes from. */
function packageOf(specifier) {
  if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/');
  return specifier.split('/')[0];
}

/** Packages the consumer's framework already provides, or that ship transitively. */
const PROVIDED = new Set(['react', 'react-dom', 'next']);

/**
 * Canonical shadcn/ui item names — the ones `shadcn add <name>` resolves. A
 * components/ui file NOT on this list is ours, and something in this registry
 * has to ship it or the install produces code that will not compile.
 */
const SHADCN_UI = new Set([
  'accordion', 'alert', 'alert-dialog', 'aspect-ratio', 'avatar', 'badge',
  'breadcrumb', 'button', 'button-group', 'calendar', 'card', 'carousel',
  'chart', 'checkbox', 'collapsible', 'command', 'context-menu', 'dialog',
  'drawer', 'dropdown-menu', 'empty', 'field', 'form', 'hover-card', 'input',
  'input-group', 'input-otp', 'item', 'kbd', 'label', 'menubar',
  'navigation-menu', 'pagination', 'popover', 'progress', 'radio-group',
  'resizable', 'scroll-area', 'select', 'separator', 'sheet', 'sidebar',
  'skeleton', 'slider', 'sonner', 'spinner', 'switch', 'table', 'tabs',
  'textarea', 'toggle', 'toggle-group', 'tooltip',
]);

/** A file under components/ui that shadcn itself publishes. */
function shadcnItemFor(path) {
  const m = /^components\/ui\/([a-z0-9-]+)\.tsx$/.exec(path);
  return m && SHADCN_UI.has(m[1]) ? m[1] : null;
}

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const versions = { ...pkg.dependencies, ...pkg.devDependencies };

/** Map every file in the registry to the item that owns it. */
const ownerOf = new Map();
for (const group of GROUPS) {
  for (const file of group.files) {
    // A file can appear in two items (editor-types.ts is shared). First wins as
    // owner; the duplicate is still shipped with its own item so either can be
    // installed alone.
    if (!ownerOf.has(file)) ownerOf.set(file, group.name);
  }
}

const IMPORT_RE = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

async function analyse(group) {
  const npm = new Set();
  const registry = new Set(group.registryDependencies ?? []);
  const missing = [];
  const unshipped = new Set();

  for (const file of group.files) {
    if (!existsSync(file)) {
      missing.push(file);
      continue;
    }
    const source = await readFile(file, 'utf8');
    for (const [, specifier] of source.matchAll(IMPORT_RE)) {
      if (specifier.startsWith('.')) continue;

      if (specifier.startsWith('@/')) {
        const path = specifier.slice(2);
        const ui = shadcnItemFor(`${path}.tsx`);
        if (ui) {
          registry.add(ui);
          continue;
        }
        // An internal file owned by another registry item.
        let resolved = false;
        for (const ext of ['', '.ts', '.tsx', '.json']) {
          const owner = ownerOf.get(path + ext);
          if (owner) {
            if (owner !== group.name) registry.add(owner);
            resolved = true;
            break;
          }
        }
        // `@/lib/utils` is created by `shadcn init`, so every consumer has it.
        if (!resolved && path !== 'lib/utils') unshipped.add(specifier);
        continue;
      }

      // Node builtins are not npm packages.
      if (specifier.startsWith('node:')) continue;

      const name = packageOf(specifier);
      if (!PROVIDED.has(name)) npm.add(name);
    }
  }

  return {
    npm: [...npm].sort(),
    registry: [...registry].sort(),
    missing,
    unshipped: [...unshipped].sort(),
  };
}

const items = [];
const problems = [];

for (const group of GROUPS) {
  const { npm, registry, missing, unshipped } = await analyse(group);
  if (missing.length) problems.push(`${group.name}: missing ${missing.join(', ')}`);
  if (unshipped.length) {
    problems.push(
      `${group.name}: imports ${unshipped.join(', ')}, which no registry item ships — ` +
        'installing this item would produce code that does not compile',
    );
  }

  const unpinned = npm.filter((n) => !versions[n]);
  if (unpinned.length) problems.push(`${group.name}: not in package.json — ${unpinned.join(', ')}`);

  items.push({
    name: group.name,
    type: group.type,
    title: group.title,
    description: group.description,
    // Pinned to the versions this repo actually builds against, so an install
    // does not silently pick up a major bump.
    dependencies: npm.map((n) => (versions[n] ? `${n}@${versions[n].replace(/^[\^~]/, '')}` : n)),
    registryDependencies: registry,
    files: group.files.map((path) => ({
      path,
      type: path.startsWith('lib/')
        ? 'registry:lib'
        : path.startsWith('app/')
          ? 'registry:page'
          : 'registry:component',
      target: path,
    })),
  });
}

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'letterstack',
  homepage: HOMEPAGE,
  items,
};

await writeFile('registry.json', `${JSON.stringify(registry, null, 2)}\n`, 'utf8');

console.log(`registry.json written — ${items.length} items`);
for (const item of items) {
  console.log(
    `  ${item.type.replace('registry:', '').padEnd(6)} ${item.name.padEnd(20)} ` +
      `${item.files.length} file(s), ${item.dependencies.length} npm, ${item.registryDependencies.length} registry`,
  );
}

if (problems.length) {
  console.error('\nProblems:');
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
