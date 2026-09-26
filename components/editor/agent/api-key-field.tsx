"use client";

// Bring-your-own-key field for the agent panel.
//
// This exists because the playground is public and the assistant is not free to
// run. In a private deployment, set GOOGLE_GENERATIVE_AI_API_KEY on the server
// and delete this component — the API route already falls back to it, so the
// panel keeps working with no key field at all.

import * as React from "react";
import { CheckIcon, ExternalLinkIcon, KeyRoundIcon, XIcon } from "lucide-react";

import { useApiKey } from "@/lib/agent/api-key";
import { cn } from "@/lib/utils";

export function ApiKeyField() {
  const { apiKey, setApiKey, loaded, hasKey } = useApiKey();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  // Open automatically when there is no key, so the first thing a visitor sees
  // is the reason the assistant will not answer yet.
  React.useEffect(() => {
    if (loaded && !hasKey) setOpen(true);
  }, [loaded, hasKey]);

  function save() {
    setApiKey(draft);
    setDraft("");
    if (draft.trim()) setOpen(false);
  }

  // Render nothing until localStorage has been read, otherwise the panel flashes
  // the "add a key" state for someone who already has one.
  if (!loaded) return null;

  return (
    <div className="shrink-0 border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] transition-colors hover:bg-accent"
      >
        <KeyRoundIcon
          className={cn("size-3.5 shrink-0", hasKey ? "text-primary" : "text-muted-foreground")}
        />
        <span className={cn("flex-1", hasKey ? "text-muted-foreground" : "text-foreground")}>
          {hasKey ? "API key set" : "Add a Google AI Studio key to use the assistant"}
        </span>
        {hasKey && <CheckIcon className="size-3 shrink-0 text-primary" />}
      </button>

      {open && (
        <div className="flex flex-col gap-2 px-3 pb-3">
          <div className="flex gap-1.5">
            <input
              type="password"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") save();
              }}
              placeholder={hasKey ? "Replace key..." : "AIza..."}
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={save}
              disabled={!draft.trim()}
              className="shrink-0 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-opacity disabled:opacity-40"
            >
              Save
            </button>
            {hasKey && (
              <button
                type="button"
                onClick={() => {
                  setApiKey("");
                  setDraft("");
                }}
                aria-label="Remove stored key"
                className="shrink-0 rounded-md border border-border px-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Kept in this browser&apos;s local storage and sent to this app&apos;s
            own route, which forwards it to Google. Never logged, never stored on
            the server. Use a free-tier key and revoke it when you are done.
          </p>

          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex w-fit items-center gap-1 text-[11px] text-primary hover:underline"
          >
            Get a free key
            <ExternalLinkIcon className="size-3" />
          </a>
        </div>
      )}
    </div>
  );
}
