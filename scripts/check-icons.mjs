/**
 * Validate every icon name used in content against lucide-react.
 *
 * Fumadocs ships no icon library: `lucideIconsPlugin` looks each name up in
 * lucide-react's `icons` map and, on a miss, logs
 * `[lucide-icons-plugin] Unknown icon detected: X` and renders nothing — which
 * leaves one sidebar row without an icon while its neighbours have one.
 *
 * This script fails the build for a name that will not resolve, and for any page
 * missing an icon, since both show up as uneven sidebar rows.
 *
 * Usage: npm run check:icons
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { icons } from 'lucide-react';

const CONTENT_DIR = 'content/docs';
// snippets are <include> fragments, not pages — they have no frontmatter
const IGNORED_DIRS = new Set(['snippets']);

/** `---[Icon]Label---` separators and `[Icon][Text](url)` links in meta.json `pages` */
const SEPARATOR_ICON = /^---\[([^\]]+)\]/;
const LINK_ICON = /^(?:external:)?\[([A-Za-z][A-Za-z0-9]*)\]\[/;

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      out.push(...(await walk(join(dir, entry.name))));
    } else {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

function frontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  return match ? match[1] : '';
}

const files = await walk(CONTENT_DIR);
/** @type {Map<string, string[]>} name -> where it is used */
const used = new Map();
const noIcon = [];

const note = (name, where) => {
  if (!used.has(name)) used.set(name, []);
  used.get(name).push(where);
};

for (const file of files) {
  const where = relative(process.cwd(), file).split(sep).join('/');
  const source = await readFile(file, 'utf8');

  if (file.endsWith('.mdx') || file.endsWith('.md')) {
    const icon = /^icon:\s*(\S+)\s*$/m.exec(frontmatter(source));
    if (icon) note(icon[1], where);
    else noIcon.push(where);
    continue;
  }

  if (!file.endsWith('meta.json')) continue;

  const meta = JSON.parse(source);
  if (meta.icon) note(meta.icon, where);
  for (const item of meta.pages ?? []) {
    const separator = SEPARATOR_ICON.exec(item);
    if (separator) note(separator[1], `${where} (${item})`);
    const link = LINK_ICON.exec(item);
    if (link) note(link[1], `${where} (${item})`);
  }
}

const unknown = [...used.keys()].filter((name) => !(name in icons)).sort();

console.log(`${used.size} distinct icon names across ${files.length} content files`);

let failed = false;

if (unknown.length > 0) {
  failed = true;
  console.error('\nUnresolvable icon names — lucide-react has no such export:');
  for (const name of unknown) {
    for (const where of used.get(name)) console.error(`  ${name.padEnd(24)} ${where}`);
  }
  console.error('\nBrowse valid names at https://lucide.dev/icons (PascalCase).');
} else {
  console.log('✓ every icon name resolves against lucide-react');
}

if (noIcon.length > 0) {
  failed = true;
  console.error('\nPages with no `icon:` in frontmatter — these render as uneven sidebar rows:');
  for (const where of noIcon.sort()) console.error(`  ${where}`);
} else {
  console.log('✓ every page declares an icon');
}

process.exit(failed ? 1 : 0);
