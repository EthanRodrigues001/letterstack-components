"use client";

// /editor — the editor on its own, no assistant.
//
// Ported from the LetterStack SaaS. What changed: "save as template" used to
// POST to /api/templates and redirect into a dashboard. There is no dashboard
// and no database here, so it downloads the document as JSON instead — the
// playground equivalent of saving, and a useful way to get a document out of
// the editor and into your own app.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { alertDialog } from "@/components/app-dialogs";
import { EditorShell } from "@/components/editor/editor-shell";
import { Spinner } from "@/components/ui/spinner";
import {
  isEmailDocument,
  normalizeDocument,
  STORAGE_KEY,
  type EmailDocument,
} from "@/lib/email/document";

export default function EditorPage() {
  const router = useRouter();

  // EditorShell reads `initialDocument` once, at mount, so the saved draft has
  // to be loaded before it renders — otherwise the shell falls back to its
  // built-in default and the draft is silently discarded.
  const [initialDoc, setInitialDoc] = useState<EmailDocument | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== "null") {
        const parsed = JSON.parse(saved);
        if (isEmailDocument(parsed)) setInitialDoc(normalizeDocument(parsed));
      }
    } catch {
      // Corrupt draft — drop it and let the shell open its default document.
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  async function handleSaveAsTemplate(doc: EmailDocument, name: string) {
    try {
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${name.trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "email"}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      await alertDialog({
        title: "Could not export",
        description: "The browser blocked the download. Try again, or copy the HTML instead.",
      });
    }
  }

  // Hold the editor until the draft is read, so EditorShell mounts once with
  // the right document instead of flashing the default first.
  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 bg-background text-sm text-muted-foreground">
        <Spinner />
        Opening editor...
      </div>
    );
  }

  return (
    <EditorShell
      mode="template-creator"
      initialDocument={initialDoc}
      onSaveAsTemplate={handleSaveAsTemplate}
      onExit={() => router.push("/")}
    />
  );
}
