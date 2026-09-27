"use client";

import { useEffect } from "react";

/**
 * Puts the editor's theme scope on <body> for as long as an editor route is
 * mounted.
 *
 * The shadcn palette lives on `.letterstack-ui` rather than `:root`, so that
 * dropping the editor into another app inherits that app's theme (see the note
 * at the top of app/global.css). Portalled surfaces — Select, DropdownMenu,
 * Tooltip, Dialog, Popover — render at document.body, which is *outside* that
 * wrapper, so `--popover` and friends resolve to nothing there and the panels
 * open transparent.
 *
 * Marking body itself is the one fix that covers every portal at once instead
 * of every call site remembering to re-apply the class. It is scoped to this
 * route group and removed on unmount, so the docs pages are untouched. Consumers
 * of the published components are unaffected: their tokens sit on :root, which
 * portals inherit already.
 */
export function ScopeBody({ className = "letterstack-ui" }: { className?: string }) {
  useEffect(() => {
    const { body, documentElement } = document;

    // global.css reserves a permanent scrollbar column on <html> so the docs
    // pages do not jump as content loads. The editor is a fixed full-screen
    // surface that never scrolls the page, so that column is dead space — and
    // it showed up as a wider gap down the right of the canvas than the left.
    const previousGutter = documentElement.style.scrollbarGutter;
    documentElement.style.scrollbarGutter = "auto";

    // Another editor route may already have added it during a transition.
    const alreadyScoped = body.classList.contains(className);
    if (!alreadyScoped) body.classList.add(className);

    return () => {
      documentElement.style.scrollbarGutter = previousGutter;
      if (!alreadyScoped) body.classList.remove(className);
    };
  }, [className]);

  return null;
}
