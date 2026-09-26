// The agent's only server surface: make exactly one model call, stream it back.
//
// It deliberately does NOT run a tool loop. Tools are declared without an
// `execute` function, so the SDK forwards every tool call to the browser, where
// the loop in `lib/agent/use-agent.ts` applies it to the EmailDocument in React
// state and decides whether to continue. That keeps edits instant and avoids
// shipping the whole document up and back on every step.
//
// Differences from the hosted version this came from: no auth, no organization,
// and no usage ledger. Those needed a database and an account. Here the caller
// brings their own Google AI Studio key, so there is no shared quota to meter
// and nothing to bill — the only server-side guard left is the step ceiling,
// which protects the caller's own key from a looping model.

import { NextResponse } from "next/server";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { agentTools } from "@/lib/agent/tools";
import { AGENT_SYSTEM_PROMPT } from "@/lib/agent/context";
import {
  AGENT_MODELS,
  findModel,
  MAX_AGENT_STEPS,
  resolveModelId,
} from "@/lib/agent/models";

export const runtime = "nodejs";
export const maxDuration = 60;

// agentTools is already `{ description, inputSchema }` per tool, which is the
// shape streamText expects. Having no `execute` is what marks them client-side:
// the SDK forwards the call to the browser instead of running it here.
const clientTools = agentTools;

/**
 * Model calls already spent on the caller's current message. One turn is one
 * user message followed by N assistant/tool round trips, so counting assistant
 * messages after the last user message gives the step number. Enforced here
 * rather than only in the client loop, otherwise the cap is advisory.
 */
function stepsInCurrentTurn(messages: UIMessage[]): number {
  const lastUser = messages.map((m) => m.role).lastIndexOf("user");
  if (lastUser < 0) return 0;
  return messages.slice(lastUser + 1).filter((m) => m.role === "assistant").length;
}

function bad(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

/**
 * Turn a refusal into a normal assistant message rather than an HTTP error.
 *
 * The client is reading a UI message stream; a JSON error body just surfaces as
 * "an error occurred" with no explanation, which is exactly how a stop ends up
 * looking like the assistant silently died. Streaming the reason back as
 * assistant text means the user reads *why* it stopped, in the conversation,
 * where they are already looking.
 */
function refusal(message: string) {
  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute({ writer }) {
        const id = "refusal";
        writer.write({ type: "text-start", id });
        writer.write({ type: "text-delta", id, delta: message });
        writer.write({ type: "text-end", id });
      },
    }),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const messages = (body?.messages ?? []) as UIMessage[];
  if (!Array.isArray(messages) || messages.length === 0) {
    return bad(400, "No messages provided.");
  }

  // Caller-supplied, per request. Falls back to a server key so a private
  // deployment can drop the panel's key field and configure it as normal.
  const apiKey =
    (typeof body?.apiKey === "string" ? body.apiKey.trim() : "") ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "";

  if (!apiKey) {
    return refusal(
      "No API key yet. Open the key field at the top of this panel and paste a Google AI Studio key — the free tier is enough to try this out. Get one at https://aistudio.google.com/apikey",
    );
  }

  if (stepsInCurrentTurn(messages) >= MAX_AGENT_STEPS) {
    return refusal(
      `I used all ${MAX_AGENT_STEPS} of my steps on that request without finishing. Try asking for a smaller change, or tell me which part to do first.`,
    );
  }

  const modelId = resolveModelId(typeof body?.model === "string" ? body.model : undefined);

  // Rebuilt by the client each turn from the live document, so it reflects
  // edits made moments ago rather than whatever was true when the chat started.
  const documentContext = typeof body?.context === "string" ? body.context : "";

  try {
    // Per-request provider instance: the key belongs to the caller, so it must
    // not be captured in a module-level singleton shared across requests.
    const google = createGoogleGenerativeAI({ apiKey });

    const result = streamText({
      model: google(modelId),
      instructions: documentContext
        ? `${AGENT_SYSTEM_PROMPT}\n\n---\nCurrent email:\n${documentContext}`
        : AGENT_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools: clientTools,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        onError: (error) => providerMessage(error, modelId),
      }),
    });
  } catch (err) {
    // Deliberately not logging the error object wholesale — provider errors can
    // echo the request, and the request carries the caller's key.
    console.error(
      "POST /api/agent/chat failed:",
      err instanceof Error ? err.message : "Unknown error",
    );
    return refusal(providerMessage(err, modelId));
  }
}

/**
 * Translate a provider failure into something the caller can act on.
 */
function providerMessage(error: unknown, modelId: string): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const model = findModel(modelId);

  if (/api[ _-]?key|unauthenticated|401|403|PERMISSION_DENIED|invalid.*credential/i.test(raw)) {
    return "Google rejected that API key. Check it was copied whole, and that the Generative Language API is enabled for it at https://aistudio.google.com/apikey";
  }

  if (/quota|rate limit|429|RESOURCE_EXHAUSTED/i.test(raw)) {
    const alternatives = AGENT_MODELS.filter((m) => m.id !== modelId)
      .map((m) => m.label)
      .join(" or ");
    return `${model?.label ?? modelId} has hit the limit on your key. Switch to ${alternatives} from the model picker, or try again after midnight UTC.`;
  }

  if (/not found|not supported|unsupported|invalid model/i.test(raw)) {
    return `${model?.label ?? modelId} isn't available on this API key. Pick a different model.`;
  }

  return raw || "The assistant failed.";
}
