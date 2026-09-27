"use client";

// /lab — the agentic editor.
//
// A parallel surface to /editor so the assistant can be worked on without
// touching the editor itself. It mirrors /editor exactly and adds only
// `renderAssistant`, sharing EditorShell rather than forking it, so canvas,
// inspector, undo and autosave stay identical.
//
// The assistant needs a Google AI Studio key, which the visitor supplies in the
// panel. See lib/agent/api-key.ts for what that means and where it is kept.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AgentPanel } from "@/components/editor/agent/agent-panel";
import { EditorShell } from "@/components/editor/editor-shell";
import { Spinner } from "@/components/ui/spinner";
import {
  isEmailDocument,
  normalizeDocument,
  STORAGE_KEY,
  type EmailDocument,
} from "@/lib/email/document";

export default function LabPage() {
  const router = useRouter();

  // Same reason as /editor: EditorShell reads `initialDocument` once at mount,
  // so the draft has to be loaded before it renders.
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
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 bg-background text-sm text-muted-foreground">
        <Spinner />
        Opening lab...
      </div>
    );
  }

  return (
    <EditorShell
      initialDocument={initialDoc}
      onExit={() => router.push("/")}
      renderAssistant={({ document, updateDocument, selectedBlockId }) => (
        <AgentPanel
          document={document}
          updateDocument={updateDocument}
          selectedBlockId={selectedBlockId}
        />
      )}
    />
  );
}
