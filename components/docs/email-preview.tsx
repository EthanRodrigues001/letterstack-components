import type * as React from 'react';

import { Email } from '@/components/email/email';
import { renderEmail } from '@/components/email/render';

/**
 * Renders email components to real email HTML on the server and shows it in
 * an iframe, so the docs preview is exactly what an inbox receives.
 *
 * Pass blocks as children and they get wrapped in <Email> for you; pass a
 * whole <Email> with `full` to control the wrapper yourself.
 */
export async function EmailPreview({
  children,
  full = false,
  height = 320,
}: {
  children: React.ReactNode;
  full?: boolean;
  height?: number;
}) {
  const html = await renderEmail(
    full ? (children as React.ReactElement) : <Email>{children}</Email>,
  );

  return (
    <iframe
      title="Email preview"
      srcDoc={html}
      // nothing in the preview needs scripts, forms or navigation
      sandbox=""
      className="not-prose my-6 w-full rounded-xl border bg-fd-muted"
      style={{ height }}
    />
  );
}
