import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';

import { baseUrl } from '@/lib/shared';

/** The shadcn CLI command for one registry item, pointed at this site. */
export function InstallBlock({ name }: { name: string }) {
  const url = new URL(`/r/${name}.json`, baseUrl).toString();

  return <DynamicCodeBlock lang="bash" code={`npx shadcn@latest add ${url}`} />;
}
