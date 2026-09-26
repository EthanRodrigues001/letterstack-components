"use client";

import * as React from "react";

/**
 * Bring-your-own-key storage for the agent playground.
 *
 * The hosted SaaS this editor came from keeps the provider key on the server
 * and meters it per account. An open-source playground cannot: there is no
 * account, and shipping a shared key would mean paying for every visitor.
 * So the key is the visitor's own.
 *
 * What that costs, stated plainly because anyone pasting a key deserves to
 * know:
 *
 * - The key is kept in `localStorage` on this origin, and is readable by any
 *   script running here. Use a key scoped to Google AI Studio's free tier, not
 *   one attached to a billing account you care about.
 * - It is sent to this app's own `/api/agent/chat` route on every turn, which
 *   forwards it to Google. It is never logged and never stored server-side.
 * - Revoke it at https://aistudio.google.com/apikey when you are done testing.
 *
 * In your own deployment, delete this file and read the key from an
 * environment variable on the server instead.
 */
const STORAGE_KEY = "letterstack:agent:google-api-key";

export function readStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    // Private mode, or site data blocked. Behave as if no key is set.
    return "";
  }
}

function writeStoredApiKey(key: string) {
  try {
    if (key) window.localStorage.setItem(STORAGE_KEY, key);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing useful to do — the key simply will not survive a reload.
  }
}

/**
 * Reads the key on mount rather than during render, so the server and the first
 * client render agree and React does not report a hydration mismatch.
 */
export function useApiKey() {
  const [apiKey, setApiKeyState] = React.useState("");
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setApiKeyState(readStoredApiKey());
    setLoaded(true);
  }, []);

  const setApiKey = React.useCallback((key: string) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    writeStoredApiKey(trimmed);
  }, []);

  return { apiKey, setApiKey, loaded, hasKey: apiKey.length > 0 };
}
