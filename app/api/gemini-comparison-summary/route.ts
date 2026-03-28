import { NextResponse } from "next/server";

import { readNonEmptyString } from "@/lib/api-request-guards";
import { requestGeminiComparisonNarrative } from "@/lib/google-gemini";

function parseGeminiBody(body: unknown):
  | { ok: true; rowsDescription: string; winnerHint: string }
  | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const rowsDescription = readNonEmptyString(
    (body as { rowsDescription?: unknown }).rowsDescription,
  );
  const winnerHint = readNonEmptyString(
    (body as { winnerHint?: unknown }).winnerHint,
  );
  if (rowsDescription === null) {
    return { ok: false, error: "rowsDescription is required" };
  }
  if (winnerHint === null) {
    return { ok: false, error: "winnerHint is required" };
  }
  return { ok: true, rowsDescription, winnerHint };
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = parseGeminiBody(json);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (typeof apiKey !== "string" || apiKey.length === 0) {
      return NextResponse.json(
        { error: "Gemini API is not configured" },
        { status: 500 },
      );
    }
    const narrative = await requestGeminiComparisonNarrative({
      rowsDescription: parsed.rowsDescription,
      winnerHint: parsed.winnerHint,
    });
    if (narrative === null) {
      return NextResponse.json(
        { error: "Could not generate summary" },
        { status: 502 },
      );
    }
    return NextResponse.json({ data: narrative });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
