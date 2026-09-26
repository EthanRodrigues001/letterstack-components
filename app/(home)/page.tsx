import Link from 'next/link';
import { appName } from '@/lib/shared';

const SURFACES = [
  {
    href: '/editor',
    title: 'Editor',
    description:
      'The full editor: canvas, blocks bar, inspector, styles, HTML and preview. No account, no backend.',
  },
  {
    href: '/lab',
    title: 'Lab',
    description:
      'The same editor with the agentic assistant attached. Bring a free Google AI Studio key.',
  },
  {
    href: '/docs',
    title: 'Docs',
    description: 'Installation, components and guides.',
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-6 py-24">
      <div className="flex flex-col gap-4">
        <p className="text-fd-muted-foreground text-sm font-medium tracking-widest uppercase">
          Open source
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-balance">
          {appName} — an email editor you can actually take apart
        </h1>
        <p className="text-fd-muted-foreground max-w-xl text-lg">
          A block-based email editor built on Tiptap, shipped as a shadcn registry. Install
          the whole thing, or just the canvas, the blocks bar, or the HTML compiler.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {SURFACES.map((surface) => (
          <Link
            key={surface.href}
            href={surface.href}
            className="border-fd-border hover:border-fd-foreground/30 hover:bg-fd-accent/40 group flex flex-col gap-1.5 rounded-xl border p-4 transition-colors"
          >
            <span className="font-medium">{surface.title}</span>
            <span className="text-fd-muted-foreground text-sm">{surface.description}</span>
          </Link>
        ))}
      </div>

      <div className="border-fd-border rounded-xl border p-4">
        <p className="text-fd-muted-foreground mb-2 text-sm">Install a piece of it</p>
        <pre className="overflow-x-auto text-sm">
          <code>npx shadcn@latest add email-editor</code>
        </pre>
      </div>
    </main>
  );
}
