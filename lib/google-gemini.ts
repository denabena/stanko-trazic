import {
  GEMINI_GENERATE_CONTENT_MODEL,
  GEMINI_REST_API_BASE,
  GEMINI_WINNER_SUMMARY_MAX_CHARS,
} from "@/constants/index";
import type { GeminiComparisonNarrative } from "@/lib/types";

function buildGeminiUrl(apiKey: string): string {
  const model = encodeURIComponent(GEMINI_GENERATE_CONTENT_MODEL);
  return `${GEMINI_REST_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

function extractTextFromGeminiPayload(data: unknown): string | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const candidates = (data as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }
  const first = candidates[0];
  if (typeof first !== "object" || first === null) {
    return null;
  }
  const content = (first as { content?: { parts?: unknown } }).content;
  if (typeof content !== "object" || content === null) {
    return null;
  }
  const parts = content.parts;
  if (!Array.isArray(parts) || parts.length === 0) {
    return null;
  }
  const part = parts[0];
  if (typeof part !== "object" || part === null) {
    return null;
  }
  const text = (part as { text?: unknown }).text;
  if (typeof text !== "string") {
    return null;
  }
  return text;
}

export async function requestGeminiComparisonNarrative(params: {
  rowsDescription: string;
  winnerHint: string;
}): Promise<GeminiComparisonNarrative | null> {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    const prompt = [
      "You help renters in Zagreb compare apartments on real monthly cost.",
      "Write one short paragraph in English, plain language, no markdown.",
      "Mention tradeoffs between price, commute, and neighborhood if relevant.",
      `Context: ${params.rowsDescription}`,
      `Likely winner or focus: ${params.winnerHint}`,
    ].join("\n");
    const url = buildGeminiUrl(apiKey);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });
    if (!response.ok) {
      return null;
    }
    const payload: unknown = await response.json();
    const raw = extractTextFromGeminiPayload(payload);
    if (raw === null) {
      return null;
    }
    const trimmed = raw.trim().slice(0, GEMINI_WINNER_SUMMARY_MAX_CHARS);
    return { plainLanguageSummary: trimmed };
  } catch (error) {
    console.error(error);
    return null;
  }
}
