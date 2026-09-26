import Link from 'next/link';
import { appName } from '@/lib/shared';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="text-fd-muted-foreground text-sm font-medium tracking-widest uppercase">
        Mock documentation
      </p>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight">
        {appName} — components for people who publish words
      </h1>
      <p className="text-fd-muted-foreground max-w-xl">
        Unstyled, composable React primitives for newsletters, editorial layouts, and reading
        experiences. Everything on this site is placeholder content.
      </p>
      <div className="flex flex-row flex-wrap items-center justify-center gap-3">
        <Link
          href="/docs/v2"
          className="bg-fd-primary text-fd-primary-foreground rounded-lg px-4 py-2 text-sm font-medium"
        >
          Read the docs
        </Link>
        <Link
          href="/docs/v2/components/overview"
          className="border-fd-border rounded-lg border px-4 py-2 text-sm font-medium"
        >
          Browse components
        </Link>
      </div>
    </main>
  );
}
