import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // `snippets/` holds fragments pulled in with <include>. They are not pages, so
    // they stay out of the collection entirely — no frontmatter, no route, no search entry.
    files: ['**/*.{md,mdx}', '!snippets/**'],
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
    // Defining collection-level MDX options removes the defaults, so we rebuild
    // them with `mdxPreset` and layer our own plugins on top.
    // See https://fumadocs.dev/docs/markdown
    async mdxOptions(environment) {
      const [{ mdxPreset }, { remarkSteps }] = await Promise.all([
        import('fumadocs-core/content/mdx/preset-bundler'),
        import('fumadocs-core/mdx-plugins'),
      ]);

      return mdxPreset({
        // `### Heading [step]` and `1. Heading` turn sibling headings into steps.
        // Runs before remark-heading so the tag never reaches the slug.
        remarkPlugins: (plugins) => [remarkSteps, ...plugins],
        // ```npm fences expand into one tab per package manager, and the
        // selection is remembered across every npm block on the site.
        remarkNpmOptions: {
          persist: { id: 'package-manager' },
        },
        // ```ts tab="..." fences group into code block tabs; parseMdx lets the
        // tab label itself contain JSX, e.g. tab="<Icon /> Next.js".
        remarkCodeTabOptions: {
          parseMdx: true,
        },
        rehypeCodeOptions: {
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
          // highlight inline code with `const a = 1{:ts}`
          inline: 'tailing-curly-colon',
        },
        // keep <img> as an import so next/image can optimise it
        remarkImageOptions: {
          useImport: environment === 'bundler',
        },
      });
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
