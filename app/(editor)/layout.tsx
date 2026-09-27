import type { ReactNode } from 'react';
import { AppDialogs } from '@/components/app-dialogs';
import { ScopeBody } from '@/components/editor/scope-body';

/**
 * Route group for the full-screen editor surfaces.
 *
 * `letterstack-ui` is what scopes the shadcn base reset — see the note at the
 * top of app/global.css. Without it the editor's borders and focus rings fall
 * back to the browser defaults.
 *
 * <AppDialogs /> is the host for the imperative `alertDialog` / `confirmDialog`
 * / `promptDialog` helpers the editor calls. It must be mounted once above
 * anything that uses them.
 */
export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="letterstack-ui isolate flex min-h-screen flex-col">
      <ScopeBody />
      {children}
      <AppDialogs />
    </div>
  );
}
